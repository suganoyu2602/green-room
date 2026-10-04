// ================================
// Supabase設定
// ================================

const SUPABASE_URL =
    "https://yepucytxmlssewdxedzp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__VL1cr7_nnYB-sPiNTadPg_lVEqwWrz";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ================================
// HTML取得
// ================================

const nicknameInput =
    document.getElementById("nickname");

const messageInput =
    document.getElementById("message");

const sendButton =
    document.getElementById("sendButton");

const sendMessage =
    document.getElementById("sendMessage");

const myConsultations =
    document.getElementById("myConsultations");


// ================================
// HTMLエスケープ
// ================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


// ================================
// ログイン中のユーザー取得
// ================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();

    if (error) {

        console.error(
            "ユーザー取得エラー:",
            error
        );

        return null;
    }

    return data.user;
}


// ================================
// 自分の相談を表示
// ================================

async function loadMyConsultations() {

    if (!myConsultations) {
        return;
    }

    myConsultations.innerHTML = `
        <div class="loading-card">
            <div class="loading-icon">🌿</div>
            <p>相談を読み込んでいます...</p>
        </div>
    `;

    const user =
        await getCurrentUser();


    // ----------------------------
    // ログインしていない場合
    // ----------------------------

    if (!user) {

        myConsultations.innerHTML = `
            <div class="empty-card">

                <div class="empty-icon">
                    🌱
                </div>

                <h3>
                    ログインすると相談を確認できます
                </h3>

                <p>
                    自分が送った相談と<br>
                    管理者からの返信を確認できます。
                </p>

                <a
                    href="login.html"
                    class="main-button small-button">

                    ログインする

                </a>

            </div>
        `;

        return;
    }


    // ----------------------------
    // 自分の相談を取得
    // ----------------------------

    const {
        data,
        error
    } =
        await supabaseClient
            .from("consultations")
            .select("*")
            .eq(
                "user_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "相談取得エラー:",
            error
        );

        myConsultations.innerHTML = `
            <div class="empty-card">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    相談を読み込めませんでした
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>
        `;

        return;
    }


    // ----------------------------
    // 相談がない場合
    // ----------------------------

    if (!data || data.length === 0) {

        myConsultations.innerHTML = `
            <div class="empty-card">

                <div class="empty-icon">
                    🌱
                </div>

                <h3>
                    まだ相談はありません
                </h3>

                <p>
                    誰かに話したいことがあれば、<br>
                    自分のペースで相談してみてください。
                </p>

            </div>
        `;

        return;
    }


    // ----------------------------
    // 相談一覧
    // ----------------------------

    myConsultations.innerHTML = "";


    data.forEach(
        function (item, index) {

            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "my-consultation-card";


            const createdAt =
                item.created_at
                    ? new Date(
                        item.created_at
                    ).toLocaleString(
                        "ja-JP"
                    )
                    : "";


            // ------------------------
            // 返信状態
            // ------------------------

            let replyArea = "";

            if (item.reply) {

                replyArea = `

                    <div class="reply-notification">

                        <span class="reply-notification-icon">
                            🔔
                        </span>

                        <span>
                            管理者から返信があります
                        </span>

                    </div>


                    <div class="reply-card">

                        <div class="reply-title">

                            <span>
                                🌿
                            </span>

                            管理者からの返信

                        </div>

                        <div class="reply-text">

                            ${escapeHtml(
                                item.reply
                            )}

                        </div>

                    </div>

                `;

            } else {

                replyArea = `

                    <div class="waiting-card">

                        <span>
                            🌱
                        </span>

                        <div>

                            <strong>
                                返信を待っています
                            </strong>

                            <p>
                                管理者から返信が届くと、ここに表示されます。
                            </p>

                        </div>

                    </div>

                `;
            }


            // ------------------------
            // カード本体
            // ------------------------

            box.innerHTML = `

                <div class="consultation-number">

                    <span>
                        相談 ${data.length - index}
                    </span>

                    ${
                        item.reply
                            ? `
                                <span class="reply-badge">
                                    返信あり
                                </span>
                              `
                            : `
                                <span class="waiting-badge">
                                    返信待ち
                                </span>
                              `
                    }

                </div>


                <div class="consultation-date">

                    ${escapeHtml(
                        createdAt
                    )}

                </div>


                <div class="user-consultation">

                    <div class="message-title">

                        <span>
                            💬
                        </span>

                        あなたの相談

                    </div>

                    <div class="consultation-text">

                        ${escapeHtml(
                            item.message || ""
                        )}

                    </div>

                </div>


                ${replyArea}

            `;


            myConsultations.appendChild(
                box
            );

        }
    );
}


// ================================
// 相談を送信
// ================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        async function () {

            const nickname =
                nicknameInput.value.trim();

            const message =
                messageInput.value.trim();


            if (!nickname) {

                alert(
                    "ニックネームを入力してください。"
                );

                return;
            }


            if (!message) {

                alert(
                    "相談内容を入力してください。"
                );

                return;
            }


            const user =
                await getCurrentUser();


            if (!user) {

                alert(
                    "相談を送るにはログインしてください。"
                );

                window.location.href =
                    "login.html";

                return;
            }


            sendButton.disabled =
                true;

            sendButton.textContent =
                "送信中...";


            if (sendMessage) {

                sendMessage.textContent =
                    "相談を送信しています...";

            }


            const {
                error
            } =
                await supabaseClient
                    .from("consultations")
                    .insert({
                        user_id:
                            user.id,

                        nickname:
                            nickname,

                        message:
                            message
                    });


            if (error) {

                console.error(
                    "送信エラー:",
                    error
                );


                if (sendMessage) {

                    sendMessage.textContent =
                        "送信できませんでした。";

                }


                alert(
                    "送信できませんでした。\n\n" +
                    error.message
                );


                sendButton.disabled =
                    false;

                sendButton.textContent =
                    "相談を送る";

                return;
            }


            if (sendMessage) {

                sendMessage.textContent =
                    "相談を送信しました！";

            }


            nicknameInput.value =
                "";

            messageInput.value =
                "";


            alert(
                "相談を送信しました！"
            );


            sendButton.disabled =
                false;

            sendButton.textContent =
                "相談を送る";


            await loadMyConsultations();

        }
    );

}


// ================================
// ページ開始
// ================================

loadMyConsultations();
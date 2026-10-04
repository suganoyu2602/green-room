const SUPABASE_URL =
    "https://yepucytxmlssewdxedzp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__VL1cr7_nnYB-sPiNTadPg_lVEqwWrz";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ========================================
// HTML要素
// ========================================

const consultationList =
    document.getElementById(
        "consultationList"
    );

const historyArea =
    document.getElementById(
        "historyArea"
    );

const adminChatArea =
    document.getElementById(
        "adminChatArea"
    );

const adminMessages =
    document.getElementById(
        "adminMessages"
    );

const adminChatMessage =
    document.getElementById(
        "adminChatMessage"
    );

const sendAdminMessageButton =
    document.getElementById(
        "sendAdminMessageButton"
    );

const backButton =
    document.getElementById(
        "backButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const chatTitle =
    document.getElementById(
        "chatTitle"
    );


// ========================================
// 現在開いている相談
// ========================================

let currentConsultationId = null;


// ========================================
// HTMLエスケープ
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


// ========================================
// ログインユーザー取得
// ========================================

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


// ========================================
// 管理者確認
// ========================================

async function checkAdmin() {

    const user =
        await getCurrentUser();

    if (!user) {

        window.location.href =
            "login.html";

        return false;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq(
                "user_id",
                user.id
            )
            .maybeSingle();


    if (error) {

        console.error(
            "管理者確認エラー:",
            error
        );

        alert(
            "管理者確認に失敗しました。\n\n" +
            error.message
        );

        return false;
    }


    if (!data) {

        alert(
            "管理者専用ページです。"
        );

        window.location.href =
            "soudan.html";

        return false;
    }


    return true;
}


// ========================================
// 相談履歴を読み込む
// ========================================

async function loadConsultations() {

    consultationList.innerHTML = `

        <div class="no-consultations">
            相談履歴を読み込んでいます...
        </div>

    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("consultations")
            .select(
                "id, created_at, nickname, message, user_id"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "相談履歴取得エラー:",
            error
        );


        consultationList.innerHTML = `

            <div class="no-consultations">

                <p>
                    相談履歴を読み込めませんでした。
                </p>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

        return;
    }


    consultationList.innerHTML = "";


    // ========================================
    // 相談が0件の場合
    // ========================================

    if (
        !data ||
        data.length === 0
    ) {

        consultationList.innerHTML = `

            <div class="no-consultations">

                <p>
                    📭 まだ相談はありません。
                </p>

                <p>
                    ユーザーが相談を送ると、
                    ここに履歴が表示されます。
                </p>

            </div>

        `;

        return;
    }


    // ========================================
    // 相談を1件ずつ表示
    // ========================================

    data.forEach(
        function (item) {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "consultation-history-card";


            const nickname =
                item.nickname ||
                "相談者";


            const message =
                item.message ||
                "相談内容はありません。";


            const createdAt =
                item.created_at
                    ? new Date(
                        item.created_at
                    ).toLocaleString(
                        "ja-JP"
                    )
                    : "";


            card.innerHTML = `

                <div class="
                    consultation-history-title
                ">

                    🌿
                    ${escapeHtml(
                        nickname
                    )}

                </div>


                <div class="
                    consultation-history-message
                ">

                    ${escapeHtml(
                        message
                    )}

                </div>


                <div class="
                    consultation-history-date
                ">

                    ${escapeHtml(
                        createdAt
                    )}

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    openAdminChat(
                        item
                    );

                }
            );


            consultationList.appendChild(
                card
            );

        }
    );

}


// ========================================
// トーク画面を開く
// ========================================

async function openAdminChat(
    consultation
) {

    currentConsultationId =
        consultation.id;


    historyArea.style.display =
        "none";


    adminChatArea.style.display =
        "block";


    chatTitle.textContent =
        "🌿 " +
        (
            consultation.nickname ||
            "相談者"
        );


    await loadAdminMessages(
        consultation
    );


    setTimeout(
        function () {

            adminMessages.scrollTop =
                adminMessages.scrollHeight;

        },
        100
    );

}


// ========================================
// トーク履歴を読み込む
// ========================================

async function loadAdminMessages(
    consultation = null
) {

    if (!currentConsultationId) {
        return;
    }


    adminMessages.innerHTML = `

        <div class="chat-loading">
            メッセージを読み込んでいます...
        </div>

    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "consultation_messages"
            )
            .select(
                "id, consultation_id, user_id, sender_type, message, created_at"
            )
            .eq(
                "consultation_id",
                currentConsultationId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "メッセージ取得エラー:",
            error
        );


        adminMessages.innerHTML = `

            <div class="chat-loading">

                <p>
                    メッセージを読み込めませんでした。
                </p>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

        return;
    }


    adminMessages.innerHTML = "";


    // ========================================
    // メッセージ履歴が存在する場合
    // ========================================

    if (
        data &&
        data.length > 0
    ) {

        data.forEach(
            function (item) {

                addMessageToScreen(
                    item
                );

            }
        );

    }


    // ========================================
    // 古い相談データの場合
    //
    // consultation_messages がまだなくても
    // consultations.message を履歴として表示
    // ========================================

    else if (
        consultation &&
        consultation.message
    ) {

        const oldMessage = {

            sender_type: "user",

            message:
                consultation.message,

            created_at:
                consultation.created_at

        };


        addMessageToScreen(
            oldMessage
        );

    }


    // ========================================
    // 本当に何もない場合
    // ========================================

    else {

        adminMessages.innerHTML = `

            <div class="chat-loading">

                まだメッセージはありません。

            </div>

        `;

    }


    adminMessages.scrollTop =
        adminMessages.scrollHeight;

}


// ========================================
// メッセージを画面に追加
// ========================================

function addMessageToScreen(
    item
) {

    const message =
        document.createElement(
            "div"
        );


    const isAdmin =
        item.sender_type ===
        "admin";


    if (isAdmin) {

        message.className =
            "chat-message my-chat-message";

    } else {

        message.className =
            "chat-message admin-chat-message";

    }


    const time =
        item.created_at
            ? new Date(
                item.created_at
            ).toLocaleTimeString(
                "ja-JP",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
            : "";


    message.innerHTML = `

        <div class="chat-bubble">

            ${escapeHtml(
                item.message
            )}

        </div>

        <div class="chat-time">

            ${escapeHtml(
                time
            )}

        </div>

    `;


    adminMessages.appendChild(
        message
    );

}


// ========================================
// 管理者から返信
// ========================================

async function sendAdminMessage() {

    const text =
        adminChatMessage.value.trim();


    if (!text) {

        return;

    }


    if (!currentConsultationId) {

        alert(
            "相談を選択してください。"
        );

        return;

    }


    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "ログインしてください。"
        );

        return;

    }


    sendAdminMessageButton.disabled =
        true;


    sendAdminMessageButton.textContent =
        "送信中...";


    const {
        error
    } =
        await supabaseClient
            .from(
                "consultation_messages"
            )
            .insert({

                consultation_id:
                    currentConsultationId,

                user_id:
                    user.id,

                sender_type:
                    "admin",

                message:
                    text

            });


    if (error) {

        console.error(
            "管理者メッセージ送信エラー:",
            error
        );


        alert(
            "返信を送信できませんでした。\n\n" +
            error.message
        );


        sendAdminMessageButton.disabled =
            false;


        sendAdminMessageButton.textContent =
            "送信";


        return;

    }


    adminChatMessage.value =
        "";


    sendAdminMessageButton.disabled =
        false;


    sendAdminMessageButton.textContent =
        "送信";


    await loadAdminMessages();

}


// ========================================
// Enterで送信
// Shift + Enterなら改行
// ========================================

if (adminChatMessage) {

    adminChatMessage.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendAdminMessage();

            }

        }
    );

}


// ========================================
// 送信ボタン
// ========================================

if (sendAdminMessageButton) {

    sendAdminMessageButton.addEventListener(
        "click",
        sendAdminMessage
    );

}


// ========================================
// 履歴に戻る
// ========================================

if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            currentConsultationId =
                null;


            adminChatArea.style.display =
                "none";


            historyArea.style.display =
                "block";


            loadConsultations();

        }
    );

}


// ========================================
// ログアウト
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (error) {

                alert(
                    "ログアウトできませんでした。\n\n" +
                    error.message
                );

                return;

            }


            window.location.href =
                "login.html";

        }
    );

}


// ========================================
// リアルタイム更新
// ========================================

function startRealtime() {

    supabaseClient
        .channel(
            "admin-consultation-messages"
        )
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "consultation_messages"
            },
            function (payload) {

                if (
                    currentConsultationId &&
                    String(
                        payload.new.consultation_id
                    ) ===
                    String(
                        currentConsultationId
                    )
                ) {

                    loadAdminMessages();

                }


                // 新しい相談メッセージが来たら
                // 履歴一覧も更新

                loadConsultations();

            }
        )
        .subscribe();

}


// ========================================
// 開始
// ========================================

async function start() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {

        return;

    }


    await loadConsultations();


    startRealtime();

}


start();
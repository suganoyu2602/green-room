const SUPABASE_URL =
    "https://yepucytxmlssewdxedzp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__VL1cr7_nnYB-sPiNTadPg_lVEqwWrz";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =========================
// HTML要素
// =========================

const nicknameInput =
    document.getElementById("nickname");

const messageInput =
    document.getElementById("message");

const sendButton =
    document.getElementById("sendButton");

const sendMessage =
    document.getElementById("sendMessage");

const consultationList =
    document.getElementById("consultationList");

const newConsultation =
    document.getElementById("newConsultation");

const chatArea =
    document.getElementById("chatArea");

const messages =
    document.getElementById("messages");

const chatMessage =
    document.getElementById("chatMessage");

const sendChatButton =
    document.getElementById("sendChatButton");

const backButton =
    document.getElementById("backButton");

const logoutButton =
    document.getElementById("logoutButton");


let currentConsultationId = null;


// =========================
// HTMLエスケープ
// =========================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


// =========================
// ログイン中のユーザー取得
// =========================

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


// =========================
// 相談一覧を読み込む
// =========================

async function loadConsultations() {

    const user =
        await getCurrentUser();

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    consultationList.innerHTML = `
        <div class="chat-box">
            相談を読み込んでいます...
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

        consultationList.innerHTML = `
            <div class="chat-box">

                <p>
                    相談を読み込めませんでした。
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


    if (!data || data.length === 0) {

        return;
    }


    data.forEach(function(item) {

        const card =
            document.createElement("button");

        card.type =
            "button";

        card.className =
            "consultation-list-card";


        const createdAt =
            item.created_at
                ? new Date(
                    item.created_at
                ).toLocaleString(
                    "ja-JP"
                )
                : "";


        card.innerHTML = `

            <div class="consultation-list-title">

                🌿 Green Room

            </div>

            <div class="consultation-list-message">

                ${escapeHtml(
                    item.message || ""
                )}

            </div>

            <div class="consultation-list-date">

                ${escapeHtml(
                    createdAt
                )}

            </div>

        `;


        card.addEventListener(
            "click",
            function() {

                openChat(item.id);

            }
        );


        consultationList.appendChild(
            card
        );

    });

}


// =========================
// チャットを開く
// =========================

async function openChat(
    consultationId
) {

    currentConsultationId =
        consultationId;


    newConsultation.style.display =
        "none";

    consultationList.style.display =
        "none";

    chatArea.style.display =
        "block";


    await loadMessages();


    setTimeout(function() {

        messages.scrollTop =
            messages.scrollHeight;

    }, 100);

}


// =========================
// メッセージ読み込み
// =========================

async function loadMessages() {

    if (!currentConsultationId) {
        return;
    }


    messages.innerHTML = `
        <div class="chat-loading">
            メッセージを読み込んでいます...
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("consultation_messages")
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

        messages.innerHTML = `
            <div class="chat-loading">

                メッセージを読み込めませんでした。

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>
        `;

        return;
    }


    messages.innerHTML = "";


    if (!data || data.length === 0) {

        messages.innerHTML = `
            <div class="chat-loading">
                まだメッセージはありません。
            </div>
        `;

        return;
    }


    data.forEach(function(item) {

        const message =
            document.createElement("div");


        const isMine =
            item.sender_type === "user";


        message.className =
            isMine
                ? "chat-message my-chat-message"
                : "chat-message admin-chat-message";


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


        messages.appendChild(
            message
        );

    });


    messages.scrollTop =
        messages.scrollHeight;

}


// =========================
// 新しい相談を始める
// =========================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        async function() {

            const nickname =
                nicknameInput.value.trim();

            const message =
                messageInput.value.trim();


            // ニックネーム確認
            if (!nickname) {

                alert(
                    "ニックネームを入力してください。"
                );

                nicknameInput.focus();

                return;
            }


            // 相談内容確認
            if (!message) {

                alert(
                    "相談内容を入力してください。"
                );

                messageInput.focus();

                return;
            }


            // ログイン確認
            const user =
                await getCurrentUser();


            if (!user) {

                alert(
                    "ログインしてください。"
                );

                window.location.href =
                    "login.html";

                return;
            }


            sendButton.disabled =
                true;

            sendButton.textContent =
                "送信中...";


            // =========================
            // 相談を作成
            // =========================

            const {
                data,
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

                    })
                    .select()
                    .single();


            if (error) {

                console.error(
                    "相談作成エラー:",
                    error
                );

                alert(
                    "相談を送信できませんでした。\n\n" +
                    error.message
                );

                sendButton.disabled =
                    false;

                sendButton.textContent =
                    "相談を始める";

                return;
            }


            // =========================
            // 最初のメッセージを保存
            // =========================

            const {
                error:
                    messageError
            } =
                await supabaseClient
                    .from(
                        "consultation_messages"
                    )
                    .insert({

                        consultation_id:
                            data.id,

                        user_id:
                            user.id,

                        sender_type:
                            "user",

                        message:
                            message

                    });


            if (messageError) {

                console.error(
                    "メッセージ保存エラー:",
                    messageError
                );

                alert(
                    "相談は作成されましたが、最初のメッセージを保存できませんでした。\n\n" +
                    messageError.message
                );

                sendButton.disabled =
                    false;

                sendButton.textContent =
                    "相談を始める";

                return;
            }


            // =========================
            // 入力欄を空にする
            // =========================

            nicknameInput.value =
                "";

            messageInput.value =
                "";


            sendButton.disabled =
                false;

            sendButton.textContent =
                "相談を始める";


            // =========================
            // 相談一覧を更新
            // =========================

            await loadConsultations();


            // =========================
            // 今作った相談を開く
            // =========================

            openChat(data.id);

        }
    );

}


// =========================
// チャット送信
// =========================

if (sendChatButton) {

    sendChatButton.addEventListener(
        "click",
        sendChat
    );

}


async function sendChat() {

    const text =
        chatMessage.value.trim();


    if (!text) {
        return;
    }


    if (!currentConsultationId) {
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


    sendChatButton.disabled =
        true;


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
                    "user",

                message:
                    text

            });


    if (error) {

        console.error(
            "メッセージ送信エラー:",
            error
        );

        alert(
            "メッセージを送信できませんでした。\n\n" +
            error.message
        );

        sendChatButton.disabled =
            false;

        return;
    }


    chatMessage.value =
        "";

    sendChatButton.disabled =
        false;


    await loadMessages();

}


// =========================
// Enterキーで送信
// =========================

if (chatMessage) {

    chatMessage.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendChat();

            }

        }
    );

}


// =========================
// 戻るボタン
// =========================

if (backButton) {

    backButton.addEventListener(
        "click",
        function() {

            currentConsultationId =
                null;

            chatArea.style.display =
                "none";

            newConsultation.style.display =
                "block";

            consultationList.style.display =
                "block";

            loadConsultations();

        }
    );

}


// =========================
// ログアウト
// =========================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

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


// =========================
// リアルタイム更新
// =========================

function startRealtime() {

    supabaseClient
        .channel(
            "consultation-messages-realtime"
        )
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "consultation_messages"
            },
            function(payload) {

                if (
                    currentConsultationId &&
                    String(
                        payload.new.consultation_id
                    ) ===
                    String(
                        currentConsultationId
                    )
                ) {

                    loadMessages();

                }

            }
        )
        .subscribe();

}


// =========================
// 開始
// =========================

async function start() {

    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    await loadConsultations();

    startRealtime();

}


start();
// ================================
// Supabase設定
// ================================

const SUPABASE_URL =
    "https://yepucytxmlssewdxedzp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__VL1cr7_nnYB-sPiNTadPg_lVEqwWrz";


// ================================
// Supabaseに接続
// ================================

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ================================
// HTMLの要素を取得
// ================================

const nicknameInput =
    document.getElementById("nickname");

const messageInput =
    document.getElementById("message");

const sendButton =
    document.getElementById("sendButton");

const messages =
    document.getElementById("messages");


// ================================
// HTMLエスケープ
// ================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


// ================================
// 相談を送信
// ================================

sendButton.addEventListener(
    "click",
    async function () {

        const nickname =
            nicknameInput.value.trim();

        const message =
            messageInput.value.trim();


        // ニックネームチェック

        if (!nickname) {

            alert(
                "ニックネームを入力してください。"
            );

            return;
        }


        // 相談内容チェック

        if (!message) {

            alert(
                "相談内容を入力してください。"
            );

            return;
        }


        // ボタンを無効にする

        sendButton.disabled = true;

        sendButton.textContent =
            "送信中...";


        // Supabaseに保存

        const { error } =
            await supabaseClient
                .from("consultations")
                .insert({
                    nickname: nickname,
                    message: message
                });


        // エラー

        if (error) {

            console.error(
                "送信エラー:",
                error
            );

            alert(
                "送信できませんでした。\n\n" +
                error.message
            );

            sendButton.disabled = false;

            sendButton.textContent =
                "相談を送る";

            return;
        }


        // 画面に相談内容を表示

        const newMessage =
            document.createElement("div");

        newMessage.className =
            "message user-message";

        newMessage.innerHTML =
            escapeHtml(message);


        messages.appendChild(
            newMessage
        );


        // 入力欄を空にする

        nicknameInput.value = "";

        messageInput.value = "";


        // 成功

        alert(
            "相談を送信しました！"
        );


        // ボタンを元に戻す

        sendButton.disabled = false;

        sendButton.textContent =
            "相談を送る";

    }
);
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
// VAPID公開キー
// ================================

const VAPID_PUBLIC_KEY =
    "BEV3OrVZt_mLdvqkjw8SNRMTjvSEGeqdXlCoLBvBSSQDdaDF7UMcodhBs2sCP6CQMqCcs1YVsoag2kp-KRUXIss";


// ================================
// HTML
// ================================

const consultations =
    document.getElementById("consultations");

const logoutButton =
    document.getElementById("logoutButton");

const enableNotificationButton =
    document.getElementById(
        "enableNotificationButton"
    );

const notificationStatus =
    document.getElementById(
        "notificationStatus"
    );


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
// 現在のユーザー
// ================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getUser();


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
// 管理者チェック
// ================================

async function checkAdmin() {

    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return false;
    }


    const {
        data: adminData,
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


    if (!adminData) {

        alert(
            "管理者専用ページです。"
        );

        window.location.href =
            "soudan.html";

        return false;
    }


    return true;
}


// ================================
// 相談一覧
// ================================

async function loadConsultations() {

    consultations.innerHTML = `
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
            .select("*")
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

        consultations.innerHTML = `
            <div class="chat-box">

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


    if (!data || data.length === 0) {

        consultations.innerHTML = `
            <div class="chat-box">

                <p>
                    まだ相談はありません。
                </p>

            </div>
        `;

        return;
    }


    consultations.innerHTML = "";


    data.forEach(
        function (item, index) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "chat-box admin-card";


            const createdAt =
                item.created_at
                    ? new Date(
                        item.created_at
                    ).toLocaleString(
                        "ja-JP"
                    )
                    : "";


            const hasReply =
                Boolean(
                    item.reply &&
                    item.reply.trim()
                );


            box.innerHTML = `

                <div class="admin-info">

                    <h2>
                        相談 ${index + 1}
                    </h2>

                    <p>

                        <strong>
                            ニックネーム：
                        </strong>

                        ${escapeHtml(
                            item.nickname ||
                            "名無し"
                        )}

                    </p>

                    <p>

                        <strong>
                            投稿日時：
                        </strong>

                        ${escapeHtml(
                            createdAt
                        )}

                    </p>

                    <p>

                        <strong>
                            状態：
                        </strong>

                        ${
                            hasReply
                                ? "返信済み"
                                : "未返信"
                        }

                    </p>

                </div>


                <div class="message user-message">

                    <strong>
                        相談内容
                    </strong>

                    <br><br>

                    ${escapeHtml(
                        item.message ||
                        ""
                    )}

                </div>


                <div class="admin-reply">

                    <label>
                        この相談への返信
                    </label>

                    <textarea
                        id="reply-${item.id}"
                        placeholder="この相談者への返信を書いてください..."
                    >${escapeHtml(
                        item.reply || ""
                    )}</textarea>

                    <button
                        class="reply-button"
                        type="button"
                        data-id="${item.id}">

                        ${
                            hasReply
                                ? "返信を更新"
                                : "返信する"
                        }

                    </button>

                </div>

            `;


            consultations.appendChild(
                box
            );

        }
    );


    const replyButtons =
        document.querySelectorAll(
            ".reply-button"
        );


    replyButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                saveReply
            );

        }
    );
}


// ================================
// 返信保存
// ================================

async function saveReply(event) {

    const button =
        event.currentTarget;


    const id =
        button.dataset.id;


    const textarea =
        document.getElementById(
            `reply-${id}`
        );


    if (!textarea) {

        alert(
            "返信欄が見つかりません。"
        );

        return;
    }


    const replyText =
        textarea.value.trim();


    if (!replyText) {

        alert(
            "返信内容を入力してください。"
        );

        return;
    }


    button.disabled =
        true;

    button.textContent =
        "保存中...";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("consultations")
            .update({
                reply:
                    replyText
            })
            .eq(
                "id",
                id
            )
            .select(
                "id, reply"
            );


    if (error) {

        console.error(
            "返信保存エラー:",
            error
        );

        alert(
            "返信を保存できませんでした。\n\n" +
            error.message
        );

        button.disabled =
            false;

        button.textContent =
            "返信する";

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        alert(
            "返信を保存できませんでした。\n\n" +
            "データベースの権限設定を確認してください。"
        );

        button.disabled =
            false;

        button.textContent =
            "返信する";

        return;
    }


    alert(
        "返信を保存しました！"
    );


    button.disabled =
        false;


    await loadConsultations();
}


// ================================
// Base64 → Uint8Array
// ================================

function urlBase64ToUint8Array(
    base64String
) {

    const padding =
        "=".repeat(
            (4 - base64String.length % 4) % 4
        );


    const base64 =
        (
            base64String +
            padding
        )
            .replace(
                /\-/g,
                "+"
            )
            .replace(
                /_/g,
                "/"
            );


    const rawData =
        window.atob(base64);


    const outputArray =
        new Uint8Array(
            rawData.length
        );


    for (
        let i = 0;
        i < rawData.length;
        ++i
    ) {

        outputArray[i] =
            rawData.charCodeAt(i);

    }


    return outputArray;
}


// ================================
// 通知を有効にする
// ================================

async function enablePushNotification() {

    if (
        !("serviceWorker" in navigator)
    ) {

        alert(
            "このブラウザはService Workerに対応していません。"
        );

        return;
    }


    if (
        !("PushManager" in window)
    ) {

        alert(
            "このブラウザはPush通知に対応していません。"
        );

        return;
    }


    if (
        !("Notification" in window)
    ) {

        alert(
            "このブラウザは通知に対応していません。"
        );

        return;
    }


    try {

        notificationStatus.textContent =
            "通知を準備しています...";


        const permission =
            await Notification.requestPermission();


        if (
            permission !== "granted"
        ) {

            notificationStatus.textContent =
                "通知が許可されていません。";

            alert(
                "通知を許可してください。"
            );

            return;
        }


        const registration =
            await navigator
                .serviceWorker
                .register(
                    "service-worker.js"
                );


        await navigator
            .serviceWorker
            .ready;


        let subscription =
            await registration
                .pushManager
                .getSubscription();


        if (!subscription) {

            subscription =
                await registration
                    .pushManager
                    .subscribe({

                        userVisibleOnly:
                            true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                VAPID_PUBLIC_KEY
                            )

                    });

        }


        const user =
            await getCurrentUser();


        if (!user) {

            alert(
                "ログインしてください。"
            );

            return;
        }


        const subscriptionJson =
            subscription.toJSON();


        const endpoint =
            subscriptionJson.endpoint;


        const p256dh =
            subscriptionJson.keys?.p256dh;


        const auth =
            subscriptionJson.keys?.auth;


        if (
            !endpoint ||
            !p256dh ||
            !auth
        ) {

            throw new Error(
                "Push通知の購読情報を取得できませんでした。"
            );

        }


        const {
            error
        } =
            await supabaseClient
                .from("push_subscriptions")
                .upsert(
                    {
                        user_id:
                            user.id,

                        endpoint:
                            endpoint,

                        p256dh:
                            p256dh,

                        auth:
                            auth
                    },
                    {
                        onConflict:
                            "endpoint"
                    }
                );


        if (error) {

            throw error;

        }


        notificationStatus.textContent =
            "🔔 通知は有効になっています！";


        enableNotificationButton.textContent =
            "🔔 通知は有効です";


        enableNotificationButton.disabled =
            true;


        alert(
            "通知を有効にしました！"
        );


    } catch (error) {

        console.error(
            "Push通知エラー:",
            error
        );


        notificationStatus.textContent =
            "通知の設定に失敗しました。";


        alert(
            "通知の設定に失敗しました。\n\n" +
            error.message
        );

    }

}


// ================================
// 通知ボタン
// ================================

if (
    enableNotificationButton
) {

    enableNotificationButton
        .addEventListener(
            "click",
            enablePushNotification
        );

}


// ================================
// Realtime
// ================================

function startRealtime() {

    supabaseClient
        .channel(
            "consultations-realtime"
        )
        .on(
            "postgres_changes",
            {
                event:
                    "INSERT",

                schema:
                    "public",

                table:
                    "consultations"
            },
            function (payload) {

                console.log(
                    "新しい相談:",
                    payload.new
                );


                loadConsultations();

            }
        )
        .subscribe(
            function (status) {

                console.log(
                    "Realtime:",
                    status
                );

            }
        );

}


// ================================
// ログアウト
// ================================

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


// ================================
// 開始
// ================================

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
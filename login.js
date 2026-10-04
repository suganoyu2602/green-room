const SUPABASE_URL =
    "https://yepucytxmlssewdxedzp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__VL1cr7_nnYB-sPiNTadPg_lVEqwWrz";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const signupButton =
    document.getElementById("signupButton");

const loginMessage =
    document.getElementById("loginMessage");


/* =========================
   ログイン
========================= */

loginButton.addEventListener(
    "click",
    login
);


async function login() {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email) {

        alert(
            "メールアドレスを入力してください。"
        );

        return;
    }


    if (!password) {

        alert(
            "パスワードを入力してください。"
        );

        return;
    }


    loginButton.disabled = true;

    loginButton.textContent =
        "ログイン中...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        console.error(error);

        alert(
            "ログインできませんでした。\n\n" +
            error.message
        );

        loginButton.disabled = false;

        loginButton.textContent =
            "ログイン";

        return;
    }


    loginMessage.textContent =
        "ログインしました！";


    /*
       管理者かどうか確認
    */

    const { data: adminData } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq(
                "user_id",
                data.user.id
            )
            .maybeSingle();


    if (adminData) {

        window.location.href =
            "kanri.html";

    } else {

        window.location.href =
            "soudan.html";

    }

}


/* =========================
   新規登録
========================= */

signupButton.addEventListener(
    "click",
    signup
);


async function signup() {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email) {

        alert(
            "メールアドレスを入力してください。"
        );

        return;
    }


    if (!password) {

        alert(
            "パスワードを入力してください。"
        );

        return;
    }


    if (password.length < 6) {

        alert(
            "パスワードは6文字以上にしてください。"
        );

        return;
    }


    signupButton.disabled = true;

    signupButton.textContent =
        "登録中...";


    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password

        });


    if (error) {

        console.error(error);

        alert(
            "登録できませんでした。\n\n" +
            error.message
        );

        signupButton.disabled = false;

        signupButton.textContent =
            "新規登録";

        return;
    }


    alert(
        "アカウントを登録しました！\n\n" +
        "メール確認が必要な場合は、届いたメールを確認してください。"
    );


    signupButton.disabled = false;

    signupButton.textContent =
        "新規登録";

}
self.addEventListener(
    "push",
    function (event) {

        let data = {};

        try {

            if (event.data) {

                data =
                    event.data.json();

            }

        } catch (error) {

            console.error(
                "通知データエラー:",
                error
            );

        }


        const title =
            data.title ||
            "🌿 Green Room";


        const options = {

            body:
                data.body ||
                "新しい相談が届きました。",

            data: {

                url:
                    data.url ||
                    "/kanri.html"

            }

        };


        event.waitUntil(

            self.registration
                .showNotification(
                    title,
                    options
                )

        );

    }
);


self.addEventListener(
    "notificationclick",
    function (event) {

        event.notification.close();


        const url =
            event.notification
                .data
                ?.url ||
            "/kanri.html";


        event.waitUntil(

            clients
                .matchAll({
                    type: "window",
                    includeUncontrolled: true
                })
                .then(
                    function (windowClients) {

                        for (
                            const client
                            of windowClients
                        ) {

                            if (
                                "focus"
                                in client
                            ) {

                                client.navigate(
                                    url
                                );

                                return client.focus();

                            }

                        }


                        if (
                            clients.openWindow
                        ) {

                            return clients.openWindow(
                                url
                            );

                        }

                    }
                )

        );

    }
);
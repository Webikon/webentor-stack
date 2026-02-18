<?php
// Throw 503 error and display "Under Maintenance" page
header("HTTP/1.0 503 Service Unavailable");
?>

<!doctype html>
<html>
    <head>
        <title>Under Maintenance</title>
        <meta charset="UTF-8">
        <style>
            body { text-align: center; padding: 100px 20px; }
            h1 { font-size: 50px; }
            body { font: 20px Helvetica, sans-serif; line-height: 1.5 }
            article { display: block; max-width: 650px; width: 100%; margin: 0 auto; }
            img { max-width: 100%; }
        </style>
    </head>

    <body>
        <article>
            <!-- <img src="https://weburl.com/wp-content/uploads/logo.png"> -->

            <h1>We'll be right back!</h1>
            <p>
                Sorry, website is down for scheduled maintenance.
            </p>
        </article>
    </body>
</html>
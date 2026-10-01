<?php
// Served by `wp maintenance-mode activate`, before WordPress loads: plain PHP only, no WP functions.
header('HTTP/1.1 503 Service Unavailable');
header('Content-Type: text/html; charset=utf-8');
// Temporary, so crawlers neither index this page nor drop the real one. About one deploy window.
header('Retry-After: 600');
?>

<!doctype html>
<html>
    <head>
        <title>Under Maintenance</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex, nofollow">
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
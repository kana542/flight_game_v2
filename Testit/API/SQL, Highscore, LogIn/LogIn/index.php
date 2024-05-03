<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic Navigation Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <?php include_once 'header.php'; ?>

    <div class="navbar">
        <a href="#home">Home</a>
        <a href="#signup">Signup</a>
        <a href="#login">Login</a>
    </div>

    <div id="home">
        <h1>Welcome to the Home Page</h1>
        <p>This is the main page of our simple website.</p>
    </div>
    <div id="signup" style="display:none;">
        <h1>Signup</h1>
        <p>Signup form will go here.</p>
    </div>
    <div id="login" style="display:none;">
        <h1>Login</h1>
        <p>Login form will go here.</p>
    </div>

    <script src="script.js"></script>
</body>
</html>

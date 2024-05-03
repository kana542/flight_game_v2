<?php
    include_once'header.php';
?>
    <section class="signup-form">
        <h2>Sign up</h2>
        <div class="signup-form-form">
            <form action="signup.inc.php" method="post">
                <input type="text" name="name" placeholder="Fullname..." >
                <input type="text" name="email" placeholder="Email..." >
                <input type="text" name="uid" placeholder="Username..." >
                <input type="password" name="pwd" placeholder="Password..." >
                <input type="password" name="pwdrepeat" placeholder="Repeat Password..." >
                <button type="submit" name="submit">Sign Up</button>
            </form>
        </div>
    </section>
    
    #error message here
<?php
    include_once'footer.php';
?>
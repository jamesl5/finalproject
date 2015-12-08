<?php 
if(isset($_POST['submit'])){

    // My email
    $to = "katrinaezis@gmail.com";
    $from = $_POST['email'];
    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $subject = "Form submission";
    $subject2 = "Copy of your form submission";
    $message = $first_name . " " . $last_name . " wrote the following:" . "\n\n" . $_POST['textarea1'];
    $message2 = "Here is a copy of your message " . $first_name . "\n\n" . $_POST['textarea1'];
    $headers = "From:" . $from;
    $headers2 = "From:" . $to;

    // Sending the email
    mail($to,$subject,$message,$headers);

    // Redirecting users to a thank you screen
    header('Location: http://localhost:8080/#/thankyou');
    }
?>
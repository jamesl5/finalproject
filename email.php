<!-- 
        Group 5
         Info-343
         Final Project
         December 9, 2015
         HTML for our login page
 -->

<?php 
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

?>
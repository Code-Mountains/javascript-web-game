<?php 
        include 'dbcon.php';


        // Strings must be escaped to prevent SQL injection attacks 
        $name = mysql_real_escape_string($_GET['name'], $database); 
        $score = mysql_real_escape_string($_GET['score'], $database); 
        $hash = mysql_real_escape_string($_GET['hash'], $database); 
        $game = 'fruitfall';


        $secretKey="fruitFall98324GME"; # this value must match the value stored in the client javascript
        
       
        
        $real_hash = md5($name . $score . $secretKey); 
        

        $badwords = array();
        include('lang/en-us.wordlist-regex.php');
        include('lang/fr.wordlist-regex.php');
        include('lang/es.wordlist-regex.php');
        include('censor.function.php');

        // cli or www?
        if (isset($argv)) {
            // get input from CLI
            $input = htmlentities(trim($argv[1]));
        } else {
            // input is the whole querystring
            $input = urldecode($_SERVER['QUERY_STRING']);
            // no HTML
            header('Content-Type: text/plain');
        }

        $censored = censorString($name, $badwords,'X');


        if($real_hash == $hash) {
            // Send variables for the MySQL database class. 
            $query = "insert into scores values (NULL, '".$censored['clean'].
                "', '".$score."','".$game."');"; 
            $result = mysql_query($query) or die('Query failed: ' . mysql_error()); 
        }
?>
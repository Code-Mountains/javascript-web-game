<?php
	include 'dbcon.php';

	$thegame = 'fruitfall';
	$page = mysql_real_escape_string($_GET['pagination'], $database);

	$query = "SELECT * FROM `scores` WHERE `game` = '$thegame' ORDER by `score` DESC LIMIT $page,10";

	$result = mysql_query($query) or die('Query failed: '.mysql_error());

	$num_results = mysql_num_rows($result);

	$score_array = array();
	for($i=0; $i<$num_results;$i++){

		$row = mysql_fetch_array($result);
		$name = $row['name'];
		$score_array[] = array('name'=>substr($name,0,11), 'score'=>$row['score']);


	}

	echo json_encode($score_array);

?>



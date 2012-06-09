<?php
// dbconnector.php
// Author: Navid Kamali
// Copy this file somewhere with no web access and reference it from worldquery.php

// Define the mysql connection variables.
define('MYSQLHOST','localhost');//MySQL host name
define('MYSQLUSER','your_db_username');//database username
define('MYSQLPASS','your_db_password');//database password
define('MYSQLDB','your_world_db_name');//database name
function opendb()
{
	$db=mysql_connect(MYSQLHOST,MYSQLUSER,MYSQLPASS) or
		die('Could not connect: <font color="red">'.mysql_error().'</font>');
	mysql_select_db(MYSQLDB,$db);
	return $db;
}
?>

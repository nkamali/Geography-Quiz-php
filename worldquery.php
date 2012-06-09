<?php
/*
   worldquery.php
   query "world" database, "select" command only
   method: POST
   content-type: application/x-www-form-urlencoded
   request: SQL select single-field query statement only
   response: resultset in XML
   author: newton chan
   created: 1-15-07
   updated: 1-20-07
*/

if(isset($_POST))
{
	//echo '<b>You sent query:</b> <font color="blue">'.$_POST['q'].'</font><br/><br/>';//DEBUG
	$querystr=trim($_POST['q']);
	if($querystr=='')
	 exit('<error>You sent an empty query.</error>');
	$token=preg_split("/[\s,]+/",$querystr);
	if(strcasecmp($token[0],'select')!=0||$token[1]=='*')
	 exit('<error>Sorry, you are not allowed to run this query.</error>');

	// I recommend moving dbconnector.php to a directory with no web access!
	require('dbconnector.php');
	//Open the database.
	$db=opendb();
 
	if($myquery=mysql_query(stripslashes($querystr)))
	{
		header("Content-Type: text/xml");  // <== Line added 12 May 07 ==
        $response="<?xml version=\"1.0\"?>\n<list>\n";
		while($row=mysql_fetch_array($myquery,MYSQL_ASSOC))
			$response.="\t<item>{$row[$token[1]]}</item>\n";
		$response.='</list>';
		echo $response;
		mysql_free_result($myquery);
	}
	else echo '<error>Could not run query: <font color="red">'.mysql_error().'</font></error>';//DEBUG
}
else echo '<error>Server did not receive a request.</error>';
?>

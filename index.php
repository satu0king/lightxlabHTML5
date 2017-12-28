<?php
require "setup.php";
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = substr(str_shuffle($characters),0,$length);
    return $randomString;
}
if(isset($_POST["data"])){
  $data=$_POST["data"];
  for($i=0;$i<=10;$i+=1){
    $hash=generateRandomString();
    $query="INSERT INTO `lightxlab`(`HASHKEY`, `DATA`) VALUES ('$hash','$data')";
    $result = mysqli_query($myConnection,$query);
    if($result)break;
  }
  echo $hash;
  exit();
}
else if(isset($_POST["retrieve"])){
  $query="SELECT * FROM `lightxlab` WHERE HASHKEY='$_POST[retrieve]'";
  $result = mysqli_query($myConnection,$query);
  $data=mysqli_fetch_assoc($result)["DATA"];
  if($data){
    echo $data;
  }
  else echo "ERROR";
  // echo '{"mirrorList":[],"sphericalMirrorList":[],"lightRayList":[],"radialSourceList":[],"lightBeamList":[]}';
  exit();
}
else
require("index.html");
?>

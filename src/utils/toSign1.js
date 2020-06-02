import md5 from 'js-md5';
const toSign=function(obj,signKey){
let nameArray=[]
for(let item in obj){
  nameArray.push(item)
}
nameArray.sort(function(a,b){
   if(a.toString().toLowerCase()>b.toString().toLowerCase())
        return 1;
    return -1;
})
let md5Before=""
nameArray.map((item)=>{
  md5Before+=obj[item].toString()
})
//if(!signKey){
md5Before+="i91oc68jrol1f0kalaet4sa3inq7en27"
//}else{
//md5Before+=signKey
//}
return md5(md5Before)
}
export default toSign;
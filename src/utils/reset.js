export default  (function (doc, win) {
  var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
      var clientWidth = docEl.clientWidth;
      if (!clientWidth) return;
      if(window.orientation == 90 || window.orientation == -90){
        //横屏
        window.horizontal=true
        docEl.style.fontSize = 0.53*50 * (clientWidth / 375) + 'px';
      }else{
        window.horizontal=false
      docEl.style.fontSize = 50 * (clientWidth / 375) + 'px';
      }
      
    
      var userAgent=/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) ? 'phone':'pc';
      if(userAgent=='pc'){
        //如果是电脑进入无感
//      document.body.style.width=640+"px"
//      docEl.style.fontSize = 50 * (640 / 375) + 'px';
      }
    }; 
 
  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
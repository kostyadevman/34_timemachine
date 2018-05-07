var TIMEOUT_IN_SECS = 3 * 60
var TEMPLATE = '<h1><span class="js-timer-minutes">00</span>:<span class="js-timer-seconds">00</span></h1>'
var ALERT_PERIOD_IN_SECS = 30
const quotes = [
    'Look on the bright side',
    'There’s light at theend of the tunnel',
    'When life gives you lemons, make lemonade',
    'Every cloud has a silver lining',
    'Keep your chin up',
    'There are plenty of fish in the sea',
    'When one door closes, another one opens',
    'Everything is coming up roses',
];

function getMotivationAlerst() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function padZero(number){
  return ("00" + String(number)).slice(-2);
}

class Timer{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  constructor(timeout_in_secs){
    this.initial_timeout_in_secs = timeout_in_secs
    this.reset()
  }
  getTimestampInSecs(){
    var timestampInMilliseconds = new Date().getTime()
    return Math.round(timestampInMilliseconds/1000)
  }
  start(){
    if (this.isRunning)
      return
    this.timestampOnStart = this.getTimestampInSecs()
    this.isRunning = true
  }
  stop(){
    if (!this.isRunning)
      return
    this.timeout_in_secs = this.calculateSecsLeft()
    this.timestampOnStart = null
    this.isRunning = false
  }
  reset(timeout_in_secs){
    this.isRunning = false
    this.timestampOnStart = null
    this.timeout_in_secs = this.initial_timeout_in_secs
  }
  calculateSecsLeft(){
    if (!this.isRunning)
      return this.timeout_in_secs
    var currentTimestamp = this.getTimestampInSecs()
    var secsGone = currentTimestamp - this.timestampOnStart
    return Math.max(this.timeout_in_secs - secsGone, 0)
  }

  runOutOfTime() {
    return this.calculateSecsLeft() === 0
  }
}

class TimerWidget{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  construct(){
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
  mount(rootTag){
    if (this.timerContainer)
      this.unmount()

    // adds HTML tag to current page
    this.timerContainer = document.createElement('div')

    var timerStyle =
       "position: fixed;" +
       "top: 30px;" +
       "left: 18px;" +
       "z-index: 9999;" +
       "margin: 0px;" +
       "color: #F4A460;" +
       "background-color: #F5DEB3;" +
       "padding: 0px;" +
       "border-radius: 40px;";

    this.timerContainer.setAttribute("style", timerStyle)
    this.timerContainer.innerHTML = TEMPLATE

    rootTag.insertBefore(this.timerContainer, rootTag.firstChild)

    this.minutes_element = this.timerContainer.getElementsByClassName('js-timer-minutes')[0]
    this.seconds_element = this.timerContainer.getElementsByClassName('js-timer-seconds')[0]
  }
  update(secsLeft){
    var minutes = Math.floor(secsLeft / 60);
    var seconds = secsLeft - minutes * 60;
    if (secsLeft) {
      this.minutes_element.innerHTML = padZero(minutes)
      this.seconds_element.innerHTML = padZero(seconds)
    }
  }
  unmount(){
    if (!this.timerContainer)
      return
    this.timerContainer.remove()
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
}


function main(){

  var timer = new Timer(TIMEOUT_IN_SECS)
  var alertTimer = new Timer(ALERT_PERIOD_IN_SECS);
  var timerWidget = new TimerWidget()
  var intervalId = null
  var intervalAlert = null

  timerWidget.mount(document.body)

  function handleIntervalTick(){
    var secsLeft = timer.calculateSecsLeft()
    timerWidget.update(secsLeft)
  }

  function handleAlerts() {
    if (timer.runOutOfTime()) {
      alertTimer.start();
      timerWidget.unmount()
    }

    if (alertTimer.runOutOfTime()) {
      alert(getMotivationAlerst())
      alertTimer = new Timer(ALERT_PERIOD_IN_SECS)
    }
  }

  function handleVisibilityChange(){
    if (document.hidden) {
      timer.stop()
      clearInterval(intervalId)
      intervalId = null
    } else {
      timer.start()
      intervalId = intervalId || setInterval(handleIntervalTick, 300)
      intervalAlert = intervalAlert || setInterval(handleAlerts, 300)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  handleVisibilityChange()
}

// initialize timer when page ready for presentation
window.addEventListener('load', main)
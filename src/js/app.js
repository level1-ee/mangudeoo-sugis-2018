import smoothscroll from 'smoothscroll-polyfill'

smoothscroll.polyfill()

const scrollToEventHandler = function (event) {
  if (event.type === 'click') {
    event.preventDefault()
    const target = event.target.getAttribute('href')
    document.querySelector(target).scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollTos = document.querySelectorAll('.js-scroll-to')
scrollTos.forEach((element) => {
  element.addEventListener('click', scrollToEventHandler, true)
})

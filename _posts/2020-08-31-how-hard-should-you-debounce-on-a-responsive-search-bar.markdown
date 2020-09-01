---
layout: post
title:  "How Hard Should You Debounce on a Responsive Search Bar"
date:   2020-08-31 12:13:00 -0600
comments: true
---

It's very cool to show the user search results in real time as they type things, but you don't want to DDoS your server.


> DDoS? Say you are making an online shop website, and the user types in **Christmas midget cosplay costume**, without debouncing, the requests will look like this:
>
> "GET /search?q=c HTTP/1.1" 200
>
> "GET /search?q=ch HTTP/1.1" 200
>
> "GET /search?q=chr HTTP/1.1" 200
>
> "GET /search?q=chri HTTP/1.1" 200
>
> "GET /search?q=chris HTTP/1.1" 200
>
> ... (27 nearly simultaneous requests later)
>
> "GET /search?q=christmas%20midget%20cosplay%20costume HTTP/1.1" 200
>
> This creates a huge ton of traffic and might overwhelm the server if the searching is inherently taxing.

To debounce means we will wait for a certain time of inactivity before we send any request at all, so that no requests will be sent while the user is typing away, and we only send the request when the user stops.

How long we should wait is then a crucial question. Too long, and the user feels laggy, too short, and the debouncing is not effective. To do a decent job, we need to know how fast people type, and wait for a little longer than the time interval between key strokes. 

To determining the wait time for debouncing, I studied a research conducted over 4,000 people in the 90s ([download pdf here](/assets/typing-study.pdf)). The research recorded the distribution of people's typing speed in terms of word per minute, or wpm. With some calculation involving the average frequent English word length, accounting for spaces between each word, I compile the following table:

|                           | Time between keystrokes (ms)   |
|---------------------------|-------------|
| The fastest 10% of people | 97 to 164   |
| 2nd 10 percent            | 167 to 188  |
| 3rd 10 percent            | 191 to 215  |
| 4th 10 percent            | 219 to 239  |
| 5th 10 percent            | 245 to 277  |
| 6th 10 percent            | 284 to 310  |
| 7th 10 percent            | 319 to 351  |
| 8th 10 percent            | 363 to 405  |
| 9th 10 percent            | 421 to 501  |
| The slowest 10 percent    | 526 to 2632 |

The data, for example, tells us 250 ms of inactivity would mean 50% of people have stopped typing.

The final waiting time could still be quite subjective. Setting it to 450 would mean roughly 90% of the invalid requests are prevented, and it seems quite good to me. 

## Code Example: Javascript

Here is some example debouncing javascript using 450 ms as the wait time. Packages with debouncing utilities should be plenty. But why not include this clean function:

```javascript
/**
 * A debounce function. Documentation: https://davidwalsh.name/javascript-debounce-function
 * @param  {Function} func      The function to debounce
 * @param  {Number}   wait      The time to wait, in milliseconds
 * @param  {Boolean}  immediate Whether to invoke the function immediately
 * @return {Function}
 */
function debounce(func, wait, immediate) {

  let timeout

  return function debounced(...args) {

    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func.apply(this, args)

  }
}

searchBar.addEventListener('input', debounce(()=>{
    search()
}, 450))

```
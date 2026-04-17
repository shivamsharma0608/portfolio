console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

//   currentLink?.classList.add('current');

// Step 3.1: Define pages and base path
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/";

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'cv/', title: 'CV' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/shivamsharma0608', title: 'GitHub' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Fix: normalize both pathnames before comparing
  a.classList.toggle('current', 
    a.host === location.host && 
    (a.pathname === location.pathname || 
     (a.pathname === '/' && location.pathname === '/index.html'))
  );

  if (a.host !== location.host) {
    a.target = '_blank';
  }

  nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `<label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>`
  );
  
  const select = document.querySelector('.color-scheme select');
  
  function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    select.value = colorScheme;
  }
  
  if ('colorScheme' in localStorage) {
    setColorScheme(localStorage.colorScheme);
  }
  
  select.addEventListener('input', function (event) {
    localStorage.colorScheme = event.target.value;
    setColorScheme(event.target.value);
  });
  
  // Step 5: Better contact form
  const form = document.querySelector('form');
  
  form?.addEventListener('submit', function (event) {
    event.preventDefault();
  
    const data = new FormData(form);
    let url = form.action + '?';
    
    for (let [name, value] of data) {
      url += `${name}=${encodeURIComponent(value)}&`;
    }
  
    url = url.slice(0, -1);
    location.href = url;
  });
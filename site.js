
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

if ('IntersectionObserver' in window && 'animate' in Element.prototype && !motionPreference.matches) {
  const activeReveals = new Set();
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      revealObserver.unobserve(element);

      if (element.contains(document.activeElement)) continue;

      if (window.anime && element.classList.contains('featured-photo')) {
        const image = element.querySelector('img');
        const finish = () => {
          anime.remove(image);
          image.style.removeProperty('transform');
          motionPreference.removeEventListener('change', finish);
        };
        motionPreference.addEventListener('change', finish);
        anime({ targets: image, scale: [1.07, 1], duration: 1200, easing: 'easeOutCubic', complete: finish });
      }
      const photo = element.hasAttribute("data-photo") || element.classList.contains("card");
      const animation = element.animate(
        [{ opacity: .1, transform: photo ? 'translateY(28px) scale(.965)' : 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
        {
          duration: photo ? 900 : 680,
          delay: Number(element.dataset.revealDelay || 0),
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards',
        }
      );
      activeReveals.add(animation);
      animation.onfinish = animation.oncancel = () => activeReveals.delete(animation);
      element.addEventListener('focusin', () => animation.cancel(), { once: true });
    }
  }, { threshold: .12 });

  document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
  motionPreference.addEventListener?.('change', (event) => {
    if (!event.matches) return;
    revealObserver.disconnect();
    activeReveals.forEach((animation) => animation.cancel());
  });
}

const dialog = document.querySelector('#event-dialog');
const quote = document.querySelector('#quote');
const message = document.querySelector('#message');
const feedback = document.querySelector('#feedback');
const requestedEvent = new URLSearchParams(location.search).get('event');
if (Array.from(quote.elements.event.options).some(option => option.value === requestedEvent)) {
  quote.elements.event.value = requestedEvent;
}
let selectedEvent = '';

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    selectedEvent = card.dataset.event;
    dialog.querySelector('img').src = card.querySelector('img').src;
    dialog.querySelector('h2').textContent = card.querySelector('.card-label').firstChild.textContent.trim();
    dialog.querySelector('p').textContent = card.dataset.description;
    dialog.showModal();
    if (window.anime && !motionPreference.matches) {
      const details = dialog.querySelectorAll('.dialog-body > *');
      anime.remove(details);
      anime({
        targets: details,
        translateY: [14, 0],
        opacity: [0, 1],
        delay: anime.stagger(65),
        duration: 520,
        easing: 'easeOutCubic',
        complete: () => details.forEach(item => {
          item.style.removeProperty('transform');
          item.style.removeProperty('opacity');
        })
      });
    }
  });
});

dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelector('#choose-event').addEventListener('click', () => {
  quote.elements.event.value = selectedEvent;
  dialog.close();
  document.querySelector('#inquiry-heading').focus();
});

const quoteText = (fields) => [
  'Hi Heavenly Events! I’d like to ask about an event.',
  'Name: ' + fields.get('name').trim(),
  'Event: ' + fields.get('event'),
  'Date: ' + (fields.get('date') || 'To be decided'),
  'Location: ' + fields.get('location').trim(),
  fields.get('details').trim() && 'Details: ' + fields.get('details').trim()
].filter(Boolean).join('\n');

quote.addEventListener('input', (event) => {
  event.target.setCustomValidity('');
  message.hidden = true;
  feedback.textContent = '';
});
quote.addEventListener('submit', async (event) => {
  event.preventDefault();
  for (const key of ['name', 'location']) {
    const field = quote.elements[key];
    if (!field.value.trim()) {
      field.setCustomValidity('Please fill in this field.');
      field.reportValidity();
      return;
    }
  }
  const inquiry = quoteText(new FormData(quote));
  message.textContent = inquiry;
  message.hidden = false;
  try {
    await navigator.clipboard.writeText(inquiry);
    feedback.textContent = 'Inquiry copied. Open Instagram and paste it into a message.';
  } catch {
    feedback.textContent = 'Copy the inquiry above and paste it into an Instagram message.';
  }
});

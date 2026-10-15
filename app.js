(() => {
  const config = window.STUDIO_CONFIG ?? {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatPrice = (value) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

  document.querySelectorAll("[data-studio-name]").forEach((element) => {
    element.textContent = config.studioName || "[Название студии]";
  });

  const heroName = document.querySelector("[data-studio-name-hero]");
  if (heroName) {
    const name = config.studioName || "[Название студии]";
    const splitAt = name.lastIndexOf(" ");
    const firstLine = splitAt > 0 ? name.slice(0, splitAt) : name;
    const secondLine = splitAt > 0 ? name.slice(splitAt + 1) : "";
    const firstSpan = document.createElement("span");
    firstSpan.textContent = firstLine;
    heroName.replaceChildren(firstSpan);
    if (secondLine) {
      const lineBreak = document.createElement("br");
      const emphasis = document.createElement("em");
      emphasis.textContent = secondLine;
      heroName.append(lineBreak, emphasis);
    }
  }

  document.querySelectorAll("[data-room]").forEach((roomElement) => {
    const room = config.rooms?.[roomElement.dataset.room];
    if (!room) return;

    const zones = roomElement.querySelector("[data-room-zones]");
    const firstPrice = roomElement.querySelector("[data-room-first-price]");
    const nextPrice = roomElement.querySelector("[data-room-next-price]");
    const booking = roomElement.querySelector("[data-room-booking]");

    if (zones) zones.textContent = room.zones ? `${room.zones} ${zoneLabel(room.zones)}` : "Количество зон уточняется";
    if (firstPrice) firstPrice.textContent = formatPrice(room.firstHour);
    if (nextPrice) nextPrice.textContent = formatPrice(room.nextHour);
    if (booking) setBookingLink(booking, room.bookingUrl || config.bookingUrl);
  });

  document.querySelectorAll("[data-booking-link]").forEach((link) => setBookingLink(link, config.bookingUrl));

  const finalBooking = document.querySelector("[data-final-booking-link]");
  const bookingStatus = document.querySelector("[data-booking-status]");
  if (finalBooking && config.bookingUrl) {
    setBookingLink(finalBooking, config.bookingUrl);
    if (bookingStatus) bookingStatus.textContent = "Выберите удобное время в форме онлайн-записи.";
  } else if (finalBooking) {
    finalBooking.hidden = true;
  }

  function setBookingLink(link, url) {
    if (url) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      return;
    }

    link.href = "#booking-note";
    link.removeAttribute("target");
    link.setAttribute("aria-label", "Перейти к информации о подключении онлайн-записи");
  }

  function zoneLabel(count) {
    const mod100 = count % 100;
    const mod10 = count % 10;
    if (mod100 >= 11 && mod100 <= 14) return "зон";
    if (mod10 === 1) return "зона";
    if (mod10 >= 2 && mod10 <= 4) return "зоны";
    return "зон";
  }

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-nav]");

  function closeMenu() {
    menuToggle?.setAttribute("aria-expanded", "false");
    navigation?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navigation?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  let lastScroll = 0;
  const header = document.querySelector("[data-header]");
  window.addEventListener(
    "scroll",
    () => {
      const currentScroll = window.scrollY;
      header?.classList.toggle("is-scrolled", currentScroll > 24);
      header?.classList.toggle("is-hidden", currentScroll > lastScroll && currentScroll > 160 && !document.body.classList.contains("menu-open"));
      lastScroll = Math.max(0, currentScroll);
    },
    { passive: true },
  );

  const revealTargets = document.querySelectorAll(".reveal, .image-reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );
    revealTargets.forEach((element) => observer.observe(element));
  }
})();

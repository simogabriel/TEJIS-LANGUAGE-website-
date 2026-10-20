import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';

const videoCopy = {
  en: { eyebrow: 'YOUR LANGUAGE. YOUR POSSIBILITIES.', title: 'Why take a language test?', text: 'A language test helps you demonstrate your skills when applying for study, work or life abroad. Watch the British Council explain how IELTS can support your next step.', source: 'Video: British Council · IELTS', watch: 'Watch on YouTube ↗', note: 'For French and German, check the specific test and score required by your institution or destination.', pause: 'Pause motion', play: 'Play motion', loading: 'Play video: Why IELTS matters', points: ['Study with a goal', 'Demonstrate your skills', 'Prepare for your next chapter'] },
  fr: { eyebrow: 'VOTRE LANGUE. VOS POSSIBILITÉS.', title: 'Pourquoi passer un test de langue ?', text: 'Un test de langue permet de démontrer vos compétences pour les études, le travail ou la vie à l’étranger. Découvrez comment l’IELTS peut accompagner votre projet dans cette vidéo du British Council.', source: 'Vidéo : British Council · IELTS', watch: 'Regarder sur YouTube ↗', note: 'Pour le français et l’allemand, vérifiez le test et le score exigés par votre établissement ou votre destination.', pause: 'Mettre en pause', play: 'Animer', loading: 'Lire la vidéo : pourquoi l’IELTS compte', points: ['Étudier avec un objectif', 'Démontrer vos compétences', 'Préparer votre prochain chapitre'] },
  de: { eyebrow: 'IHRE SPRACHE. IHRE MÖGLICHKEITEN.', title: 'Warum eine Sprachprüfung ablegen?', text: 'Eine Sprachprüfung hilft Ihnen, Ihre Kenntnisse für Studium, Arbeit oder das Leben im Ausland nachzuweisen. In diesem Video erklärt der British Council, wie IELTS Ihren nächsten Schritt unterstützen kann.', source: 'Video: British Council · IELTS', watch: 'Auf YouTube ansehen ↗', note: 'Prüfen Sie für Französisch und Deutsch, welchen Test und welches Ergebnis Ihre Einrichtung oder Ihr Zielland verlangt.', pause: 'Bewegung pausieren', play: 'Bewegung starten', loading: 'Video abspielen: Warum IELTS wichtig ist', points: ['Zielgerichtet studieren', 'Sprachkenntnisse nachweisen', 'Das nächste Kapitel vorbereiten'] }
};

const offlineCopy = {
  en: { text: 'Discover how language tests can support your study, work and travel goals in this original Tejis explainer. The video is stored with the website and plays without YouTube.', source: 'TEJIS · 36-second animated explainer · Text-led video', watch: 'Download video ↓', ready: 'Video saved for offline viewing', waiting: 'Preparing offline playback…', unavailable: 'Download the video to keep an offline copy.', gravity: 'A WORLD WITHOUT LIMITS', gravityTitle: 'Let your ambitions take flight.', gravityNote: 'Three languages. A world of possibilities.', passport: 'YOUR NEXT CHAPTER', destination: 'THE WORLD' },
  fr: { text: 'Découvrez comment les tests de langue peuvent accompagner vos projets d’études, de travail et de voyage dans cette vidéo originale Tejis. Elle est stockée avec le site et se lit sans YouTube.', source: 'TEJIS · Vidéo animée de 36 secondes · Texte à l’écran', watch: 'Télécharger la vidéo ↓', ready: 'Vidéo enregistrée pour une lecture hors ligne', waiting: 'Préparation de la lecture hors ligne…', unavailable: 'Téléchargez la vidéo pour conserver une copie hors ligne.', gravity: 'UN MONDE SANS LIMITES', gravityTitle: 'Donnez des ailes à vos ambitions.', gravityNote: 'Trois langues. Un monde de possibilités.', passport: 'VOTRE PROCHAIN CHAPITRE', destination: 'LE MONDE' },
  de: { text: 'Entdecken Sie in diesem originalen Tejis-Erklärvideo, wie Sprachtests Ihre Ziele für Studium, Arbeit und Reisen unterstützen können. Das Video ist lokal gespeichert und spielt ohne YouTube ab.', source: 'TEJIS · 36-sekündiges Erklärvideo · Text im Bild', watch: 'Video herunterladen ↓', ready: 'Video für die Offline-Wiedergabe gespeichert', waiting: 'Offline-Wiedergabe wird vorbereitet…', unavailable: 'Laden Sie das Video herunter, um eine Offline-Kopie zu behalten.', gravity: 'EINE WELT OHNE GRENZEN', gravityTitle: 'Verleihen Sie Ihren Zielen Flügel.', gravityNote: 'Drei Sprachen. Eine Welt voller Möglichkeiten.', passport: 'IHR NÄCHSTES KAPITEL', destination: 'DIE WELT' }
};

function FlightAndVideo() {
  const [language, setLanguage] = useState(document.documentElement.lang);
  const [paused, setPaused] = useState(false);
  const [offline, setOffline] = useState('waiting');
  const copy = videoCopy[language] || videoCopy.en;
  const local = offlineCopy[language] || offlineCopy.en;
  const videoLanguage = ['en', 'fr', 'de'].includes(language) ? language : 'en';
  useEffect(() => {
    if (!('serviceWorker' in navigator)) { setOffline('unavailable'); return; }
    let mounted = true;
    navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then(() => {
      if (mounted) setOffline('ready');
    }).catch(() => { if (mounted) setOffline('unavailable'); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    const observer = new MutationObserver(() => setLanguage(document.documentElement.lang));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    document.body.classList.toggle('animations-paused', paused);
    return () => document.body.classList.remove('animations-paused');
  }, [paused]);
  return <>
    {createPortal(<section className="anti-gravity" aria-labelledby="gravity-title"><div className="gravity-copy"><p className="eyebrow">{local.gravity}</p><h2 id="gravity-title">{local.gravityTitle}</h2><p>{local.gravityNote}</p><button className="gravity-pause" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? '▶' : 'Ⅱ'} {paused ? copy.play : copy.pause}</button></div><div className="gravity-scene" aria-hidden="true"><div className="gravity-orbit" /><div className="gravity-passport"><span>TEJIS</span><small>{local.passport}</small><span className="passport-globe">◎</span><small>{local.destination}</small></div><span className="gravity-chip chip-en">ENGLISH</span><span className="gravity-chip chip-fr">FRANÇAIS</span><span className="gravity-chip chip-de">DEUTSCH</span><svg className="gravity-plane" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /></svg><span className="gravity-star star-one">✦</span><span className="gravity-star star-two">✧</span></div></section>, document.querySelector('#anti-gravity-root'))}
    {createPortal(<>
      <div className="flight-scene" aria-hidden="true">
        <svg className="flight-path" viewBox="0 0 600 500" preserveAspectRatio="none"><path d="M-40 350 C120 350 130 45 330 90 S550 300 650 30" /></svg>
        <div className="flying-plane"><span className="plane-trail" /><svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /></svg></div>
        <span className="flight-cloud cloud-one">☁</span><span className="flight-cloud cloud-two">☁</span>
      </div>
      <button className="motion-toggle" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? '▶' : 'Ⅱ'} {paused ? copy.play : copy.pause}</button>
    </>, document.querySelector('.hero-art'))}
    {createPortal(<section className="section language-video" id="why-tests" aria-labelledby="video-heading"><div className="video-copy"><p className="eyebrow">{copy.eyebrow}</p><h2 id="video-heading">{copy.title}</h2><p>{local.text}</p><ul>{copy.points.map((point, i) => <li key={i}><span>0{i + 1}</span>{point}</li>)}</ul><p className="video-note">{copy.note}</p></div><div className="video-panel"><div className="video-player"><video key={videoLanguage} controls playsInline preload="metadata" poster={`assets/language-tests-${videoLanguage}.jpg`} aria-label={copy.title}><source src={`assets/language-tests-${videoLanguage}.mp4`} type="video/mp4" /><track kind="captions" src={`assets/language-tests-${videoLanguage}.vtt`} srcLang={videoLanguage} label={{en:'English',fr:'Français',de:'Deutsch'}[videoLanguage]} />{local.unavailable}</video></div><div className="video-caption"><span>{local.source}</span><a href={`assets/language-tests-${videoLanguage}.mp4`} download>{local.watch}</a></div><p className="offline-status" role="status">{local[offline]}</p></div></section>, document.querySelector('#language-video-root'))}
  </>;
}

function JourneyAnimations() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const heading = document.querySelector('.hero-copy h1');
    function prepareLines() {
      if (heading.querySelector(':scope > .hero-line')) return;
      const lines = heading.innerHTML.split(/<br\s*\/?>/i).map((markup, index, parts) => {
        const line = document.createElement('span');
        line.className = 'hero-line';
        line.innerHTML = markup + (index < parts.length - 1 ? ' ' : '');
        return line;
      });
      heading.replaceChildren(...lines);
    }
    prepareLines();
    const observer = new MutationObserver(prepareLines);
    observer.observe(heading, { childList: true });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    let frame;
    const targets = document.querySelectorAll('.hero-copy > *, .ticket, .destination, .section-heading, .course, .about-visual, .about-copy, .reference-links a, .contact > div');
    function setup() {
      observer?.disconnect();
      targets.forEach(el => el.classList.remove('reveal-pending'));
      document.body.classList.toggle('motion-enabled', !preference.matches);
      if (preference.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }), { threshold: 0.08 });
      targets.forEach((el, index) => {
        el.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 65}ms`);
        el.classList.add('reveal-pending');
        observer.observe(el);
      });
    }
    function updateProgress() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0);
        frame = undefined;
      });
    }
    setup();
    updateProgress();
    preference.addEventListener('change', setup);
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      targets.forEach(el => el.classList.remove('reveal-pending'));
      document.body.classList.remove('motion-enabled');
      preference.removeEventListener('change', setup);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);
  return <><div className="journey-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} /><FlightAndVideo /></>;
}

const mount = document.createElement('div');
mount.id = 'journey-animations';
document.body.append(mount);
createRoot(mount).render(<JourneyAnimations />);

/* Aide-moi Douala — prototype front-end (routeur, pages, interactions) */
(function () {
  'use strict';
  const { CATS, OFFRES, ARTICLES, VIDEOS, QUARTIERS, PUBLICS, ic } = AMD;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fcfa = (n) => Number(n).toLocaleString('fr-FR') + ' FCFA';
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const dayLabel = (d) => (d === 0 ? 'aujourd\'hui' : d === -1 ? 'hier' : `il y a ${-d} jours`);
  const prixTxt = (o) => (o.prixMax ? `${o.prix.toLocaleString('fr-FR')} – ${fcfa(o.prixMax)}` : fcfa(o.prix)) + (o.unite ? ` <small>${o.unite}</small>` : '');
  const waLink = (msg) => `https://wa.me/${AMD.WHATSAPP}?text=${encodeURIComponent(msg)}`;
  const initials = (n) => String(n).trim().split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase();

  /* ---------------- état (sauvegardé dans le navigateur) ---------------- */
  const KEY = 'aidemoi.v2';
  const fresh = () => ({ questions: JSON.parse(JSON.stringify(AMD.SEED_QUESTIONS)), commandes: [], votes: {}, utile: {}, vip: false, mesQuestions: [], visites: 1000, pubClics: 37, sponsorActif: true });
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); }
  S.visites += 1;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* mode privé */ } };
  save();

  /* ---------------- composants ---------------- */
  function toast(msg, type = 'ok') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-ic">${ic(type === 'ok' ? 'checkCircle' : type === 'info' ? 'message' : 'bell', 18)}</span><p>${msg}</p>`;
    $('#toasts').appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 300); }, 4200);
  }
  function modal(html, cls = '') {
    const w = document.createElement('div');
    w.className = 'modal-wrap';
    w.innerHTML = `<div class="modal-bg" data-x></div><div class="modal ${cls}" role="dialog" aria-modal="true"><button class="modal-x" data-x aria-label="Fermer">${ic('x', 18)}</button>${html}</div>`;
    document.body.appendChild(w);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => w.classList.add('open'));
    const close = () => { w.classList.remove('open'); document.body.style.overflow = ''; setTimeout(() => w.remove(), 250); document.removeEventListener('keydown', key); };
    const key = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    w.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) close(); });
    return { el: w, close };
  }
  const catBadge = (c) => `<span class="cat">${ic(CATS[c].icon, 14)}${CATS[c].label}</span>`;
  const statutBadge = (s) => ({ resolu: `<span class="st ok">${ic('check', 13, 2.6)}Résolu</span>`, repondu: `<span class="st rep">${ic('message', 13)}Répondu</span>`, attente: `<span class="st wait">${ic('clock', 13)}En attente</span>` }[s]);
  const stars = (n = 5) => `<span class="stars">${Array.from({ length: n }, () => ic('star', 15, 0)).join('')}</span>`;
  const sectionHead = (eyebrow, title, sub, right = '') => `<div class="s-head"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${right}</div>`;

  /* ---------------- paiement simulé (Mobile Money) ---------------- */
  function commander(offreId) {
    const o = OFFRES.find((x) => x.id === offreId);
    const prix = S.vip && o.id !== 'vip' && o.id !== 'formation' ? Math.round(o.prix * 0.8) : o.prix;
    const m = modal(`
      <div class="pay">
        <div class="pay-head"><span class="pay-ic">${ic(o.icon, 24)}</span><div><small>Ta commande</small><h3>${esc(o.titre)}</h3><p>${ic('clock', 13)} ${o.delai}</p></div></div>
        <div class="pay-sum"><span>Total à payer</span><b>${fcfa(prix)}${o.unite ? `<small> ${o.unite}</small>` : ''}</b></div>
        ${S.vip && prix !== o.prix ? `<p class="pay-vip">${ic('crown', 15)} Remise VIP de 20 % appliquée</p>` : ''}
        <form id="payForm" novalidate>
          <label class="lbl" for="pNom">Ton prénom</label>
          <input class="in" id="pNom" name="nom" placeholder="ex. Junior" autocomplete="given-name">
          <span class="lbl">Moyen de paiement</span>
          <div class="pay-ops">
            <label class="pop"><input type="radio" name="op" value="om" checked><span><i class="opl om">OM</i><b>Orange Money</b><small>Confirmation par code secret</small></span></label>
            <label class="pop"><input type="radio" name="op" value="momo"><span><i class="opl momo">MoMo</i><b>MTN Mobile Money</b><small>Confirmation par code secret</small></span></label>
            <label class="pop"><input type="radio" name="op" value="apres"><span><i class="opl later">${ic('clock', 16)}</i><b>Payer après le service</b><small>Réservation d'un créneau</small></span></label>
          </div>
          <label class="lbl" for="pTel">Numéro de téléphone</label>
          <div class="in-pre"><span>+237</span><input class="in" id="pTel" name="tel" inputmode="numeric" placeholder="6XX XX XX XX" maxlength="12" autocomplete="tel-national"></div>
          <p class="err" id="payErr"></p>
          <button class="btn primary big full" type="submit">${ic('lock', 17)}<span>Payer ${fcfa(prix)}</span></button>
          <p class="demo-note">Prototype de démonstration : aucun paiement réel n'est effectué.</p>
        </form>
      </div>`, 'sm');
    const f = $('#payForm', m.el);
    f.op.forEach((r) => r.addEventListener('change', () => { f.querySelector('button span').textContent = f.op.value === 'apres' ? 'Réserver mon créneau' : `Payer ${fcfa(prix)}`; }));
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const tel = f.tel.value.replace(/\s/g, '');
      const err = $('#payErr', m.el);
      if (!f.nom.value.trim()) { err.textContent = 'Indique ton prénom.'; f.nom.focus(); return; }
      if (!/^6\d{8}$/.test(tel)) { err.textContent = 'Numéro invalide : 9 chiffres commençant par 6.'; f.tel.focus(); return; }
      err.textContent = '';
      const op = f.op.value;
      const box = $('.pay', m.el);
      if (op === 'apres') return valider(box, o, prix, f.nom.value.trim(), tel, op);
      box.innerHTML = `<div class="pay-wait"><div class="phone-anim"><div class="ph">${ic('smartphone', 46, 1.4)}</div><span class="ring"></span><span class="ring r2"></span></div><h3>Confirme sur ton téléphone</h3><p>Une demande ${op === 'om' ? 'Orange Money' : 'MTN Mobile Money'} de <b>${fcfa(prix)}</b> a été envoyée au <b>+237 ${tel.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1$2 $3 $4 $5')}</b>. Saisis ton code secret sur ton téléphone pour valider.</p><div class="wait-bar"><i></i></div><p class="demo-note">Simulation : validation automatique dans 3 secondes.</p></div>`;
      setTimeout(() => valider(box, o, prix, f.nom.value.trim(), tel, op), 3000);
    });
  }
  function valider(box, o, prix, nom, tel, op) {
    const ref = 'AMD-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    S.commandes.unshift({ ref, offre: o.id, titre: o.titre, prix, nom, tel, op, date: new Date().toISOString(), statut: op === 'apres' ? 'à encaisser' : 'payé' });
    if (o.id === 'vip') S.vip = true;
    save();
    box.innerHTML = `<div class="pay-ok"><div class="ok-ic">${ic('check', 38, 3)}</div><h3>${op === 'apres' ? 'Créneau réservé' : 'Paiement reçu'}</h3>
      <p>Merci ${esc(nom)}, ta commande est confirmée.</p>
      <div class="receipt"><div><span>Référence</span><b>${ref}</b></div><div><span>Service</span><b>${esc(o.titre)}</b></div><div><span>Montant</span><b>${fcfa(prix)}</b></div><div><span>Statut</span><b class="${op === 'apres' ? 'amber' : 'green'}">${op === 'apres' ? 'À régler après le service' : 'Payé'}</b></div></div>
      <ul class="next"><li>${ic('whatsapp', 16)}Ryan te contacte sur WhatsApp dans les 15 minutes</li><li>${ic('receipt', 16)}Ton reçu est envoyé par SMS</li>${o.id === 'vip' ? `<li>${ic('crown', 16)}Statut VIP activé : questions illimitées</li>` : ''}</ul>
      <a class="btn wa full" target="_blank" rel="noopener" href="${waLink(`Bonjour Ryan, je suis ${nom}. Commande ${ref} : ${o.titre}.`)}">${ic('whatsapp', 18)}Écrire à Ryan sur WhatsApp</a></div>`;
    toast(`Commande ${ref} enregistrée.`);
    renderChrome();
  }

  /* ---------------- vidéo (lecteur simulé) ---------------- */
  function playVideo(id) {
    const v = VIDEOS.find((x) => x.id === id);
    const m = modal(`<div class="player"><div class="screen" style="background-image:url('${v.img}')"><div class="screen-shade"></div><div class="bars">${v.slides.map(() => '<i><b></b></i>').join('')}</div>
      <div class="screen-top">${AMD.logoMark(30)}<div><b>aidemoi.douala</b><small>${v.duree}</small></div></div><div class="slide"></div></div>
      <div class="player-foot"><b>${esc(v.titre)}</b><a href="#/blog/${v.article}" data-x class="link">Lire le guide complet ${ic('arrow', 15)}</a></div></div>`, 'video');
    let i = 0;
    const sl = $('.slide', m.el), bars = $$('.bars i', m.el);
    const step = () => {
      if (!document.body.contains(m.el)) return;
      sl.classList.remove('in'); void sl.offsetWidth;
      sl.textContent = v.slides[i]; sl.classList.add('in');
      bars.forEach((b, k) => { b.className = k < i ? 'done' : k === i ? 'cur' : ''; });
      i = (i + 1) % v.slides.length;
      setTimeout(step, 1900);
    };
    step();
  }

  /* ---------------- pages ---------------- */
  const pages = {};
  const artCard = (a) => `<a class="art" href="#/blog/${a.id}"><div class="art-img"><img src="${a.img}" alt="" loading="lazy">${catBadge(a.cat)}</div><div class="art-body"><h3>${esc(a.titre)}</h3><p>${esc(a.intro)}</p><div class="art-meta"><span>${ic('clock', 14)}${a.min} min</span><span>${ic('eye', 14)}${a.vues.toLocaleString('fr-FR')}</span><span class="art-go">Lire ${ic('arrow', 14)}</span></div></div></a>`;
  const sponsor = () => (S.sponsorActif ? `<aside class="sponsor"><span class="sp-tag">Annonce</span><div class="sp-logo">IP</div><div class="sp-txt"><b>${esc(AMD.SPONSOR.nom)}</b><p>${esc(AMD.SPONSOR.texte)}</p><small>${ic('pin', 13)}${esc(AMD.SPONSOR.lieu)}</small></div><button class="btn ghost" data-pub>Voir l'offre</button></aside>` : '');

  pages.accueil = () => {
    const pop = [...ARTICLES].sort((a, b) => b.vues - a.vues).slice(0, 3);
    const aides = S.questions.length * 37 + 250;
    return `
    <section class="hero">
      <div class="hero-txt">
        <span class="live"><i></i>En ligne maintenant · réponse gratuite en moins de 2 h</span>
        <h1>Un souci avec ton PC ou ton téléphone&nbsp;? <span class="grad">On t'aide, gratuitement.</span></h1>
        <p class="lead">Virus, PC lent, téléphone qui ne s'allume plus, CV, Excel pour le stage… Pose ta question, on t'explique pas à pas. Et si c'est trop compliqué, on s'en occupe pour toi.</p>
        <form class="search" id="heroSearch" role="search"><span class="s-ic">${ic('search', 20)}</span><input name="q" placeholder="Décris ton problème, ex. « mon PC est lent »" autocomplete="off" aria-label="Décris ton problème"><button class="btn primary">Trouver une solution</button></form>
        <div class="suggest" id="suggest"><span>Populaire :</span>${[['PC lent', 'pc-lent'], ['Clé USB', 'cle-usb-raccourcis'], ['Virus', 'virus-5-minutes'], ['CV', 'cv-word-20-minutes'], ['Excel', 'excel-5-formules']].map(([l, id]) => `<a href="#/blog/${id}">${l}</a>`).join('')}</div>
        <div class="trust"><div class="avs">${['av1', 'av2', 'av3', 'av4'].map((a) => `<img src="img/${a}.jpg" alt="">`).join('')}</div><div><div class="trust-top">${stars()}<b>4,9/5</b></div><span>${aides.toLocaleString('fr-FR')} personnes aidées à Douala</span></div></div>
      </div>
      <div class="hero-visual">
        <div class="hero-photo"><img src="img/hero.jpg" alt="Une jeune femme souriante devant son ordinateur portable"></div>
        <div class="fcard f-chat"><img src="img/av5.jpg" alt=""><div><b>Ryan a répondu ${ic('checkCircle', 14)}</b><p>Désactive les programmes au démarrage : Ctrl + Maj + Échap…</p></div></div>
        <div class="fcard f-stat"><span class="f-ic green">${ic('zap', 18)}</span><div><small>Temps de réponse moyen</small><b>18 min</b></div></div>
        <div class="fcard f-pay"><span class="opl om">OM</span><span class="opl momo">MoMo</span><small>Paiement mobile accepté</small></div>
      </div>
    </section>

    <section class="stats">
      ${[[aides.toLocaleString('fr-FR') + '+', 'personnes aidées'], ['18 min', 'délai moyen de réponse'], ['10', 'guides gratuits détaillés'], ['97 %', 'problèmes résolus']].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}
    </section>

    <section class="block">
      ${sectionHead('Aide gratuite', 'De quoi as-tu besoin&nbsp;?', 'Choisis ton problème : tu trouveras un guide pas à pas, testé et en français simple.')}
      <div class="cats">${Object.entries(CATS).map(([k, c]) => `<a class="catcard" href="#/blog?cat=${k}"><span class="cat-ic">${ic(c.icon, 24)}</span><b>${c.label}</b><small>${ARTICLES.filter((a) => a.cat === k).length} guide${ARTICLES.filter((a) => a.cat === k).length > 1 ? 's' : ''}</small><span class="cat-go">${ic('arrow', 16)}</span></a>`).join('')}</div>
    </section>

    <section class="block how">
      <div class="how-photo"><img src="img/communaute.jpg" alt="Un groupe de personnes réunies autour d'un ordinateur portable"><div class="how-badge">${ic('users', 18)}<div><b>Communauté d'entraide</b><small>${S.questions.length} questions cette semaine</small></div></div></div>
      <div class="how-txt">
        ${sectionHead('Comment ça marche', 'On aide d\'abord. Toujours.', '')}
        <ol class="steps">
          <li><span>1</span><div><h3>Tu poses ta question</h3><p>Gratuitement, par le formulaire ou sur WhatsApp. Pas besoin de créer de compte.</p></div></li>
          <li><span>2</span><div><h3>On te répond pas à pas</h3><p>Une explication claire, souvent en moins de 2 heures, avec le bon guide.</p></div></li>
          <li><span>3</span><div><h3>Trop compliqué ? On le fait</h3><p>Dépannage à distance dès 5 000 FCFA, satisfait ou remboursé.</p></div></li>
        </ol>
        <a class="btn primary big" href="#/question">Poser ma question ${ic('arrow', 18)}</a>
      </div>
    </section>

    <section class="block">
      ${sectionHead('Vidéos', 'Réglé en moins d\'une minute', 'Nos astuces les plus vues sur TikTok, à regarder ici.')}
      <div class="vids">${VIDEOS.map((v) => `<button class="vid" data-video="${v.id}"><img src="${v.img}" alt="" loading="lazy"><span class="vid-shade"></span><span class="play">${ic('play', 22, 0)}</span><span class="vid-txt"><b>${esc(v.titre)}</b><small>${ic('clock', 13)}${v.duree} · ${v.vues} vues</small></span></button>`).join('')}</div>
    </section>

    <section class="block">
      ${sectionHead('Blog d\'aide', 'Les guides les plus lus', '', `<a class="link" href="#/blog">Voir tous les guides ${ic('arrow', 15)}</a>`)}
      <div class="arts">${pop.map(artCard).join('')}</div>
    </section>

    <section class="block">
      ${sectionHead('Pour qui ?', 'Pensé pour ton quotidien', '')}
      <div class="aud">
        <a class="aud-card" href="#/solutions" data-sfset="etudiant"><img src="img/etudiante.jpg" alt="Étudiante souriante avec un casque audio et ses cours"><div class="aud-txt"><span class="aud-tag">${ic('graduation', 15)}Étudiants</span><h3>Réussis ton stage et tes candidatures</h3><ul><li>CV professionnel en 24 h</li><li>Word, Excel, PowerPoint en vidéo</li><li>PC rapide pour le mémoire</li></ul><span class="aud-go">Voir les offres étudiants ${ic('arrow', 16)}</span></div></a>
        <a class="aud-card" href="#/solutions" data-sfset="commercant"><img src="img/commercante.jpg" alt="Commerçante souriante au comptoir de sa boutique"><div class="aud-txt"><span class="aud-tag">${ic('store', 15)}Commerçants</span><h3>Fais tourner ta boutique sans souci</h3><ul><li>WhatsApp Business sécurisé</li><li>Tableau Excel stock et ventes</li><li>Dépannage rapide sans te déplacer</li></ul><span class="aud-go">Voir les offres commerçants ${ic('arrow', 16)}</span></div></a>
      </div>
    </section>

    ${sponsor()}

    <section class="block">
      ${sectionHead('Témoignages', 'Ils ont été aidés', '')}
      <div class="temos">${AMD.TEMOIGNAGES.map((t) => `<figure class="temo">${stars(t.note)}<blockquote>${esc(t.texte)}</blockquote><figcaption><img src="${t.av}" alt=""><div><b>${esc(t.nom)}</b><small>${ic('pin', 12)}${esc(t.quartier)}</small></div></figcaption></figure>`).join('')}</div>
    </section>

    <section class="vipband">
      <div class="vip-txt"><span class="eyebrow light">${ic('crown', 15)} Abonnement VIP</span><h2>Des questions illimitées, une réponse en moins d'1 h.</h2><p>-20 % sur tous les dépannages et toutes les formations incluses. Sans engagement.</p>
        ${S.vip ? `<span class="btn white">${ic('checkCircle', 18)}Tu es déjà VIP</span>` : `<button class="btn white big" data-buy="vip">Devenir VIP · 5 000 FCFA / mois</button>`}</div>
      <div class="vip-photo"><img src="img/agent.jpg" alt="Ryan, technicien, au poste d'assistance"><div class="fcard f-agent"><span class="dot-on"></span><div><b>Ryan</b><small>Technicien · disponible</small></div></div></div>
    </section>`;
  };

  pages.question = () => `
    <div class="page-head"><span class="eyebrow">Aide gratuite</span><h1>Pose ta question</h1><p>Plus tu donnes de détails, plus la réponse sera précise. C'est gratuit et sans inscription.</p></div>
    <div class="qgrid">
      <form class="card qform" id="qForm" novalidate>
        <div class="row2">
          <div><label class="lbl" for="qNom">Ton prénom <i>*</i></label><input class="in" id="qNom" name="nom" placeholder="ex. Brenda" autocomplete="given-name"></div>
          <div><label class="lbl" for="qQ">Ton quartier</label><div class="sel"><select class="in" id="qQ" name="quartier">${QUARTIERS.map((q) => `<option>${q}</option>`).join('')}</select>${ic('chevron', 16)}</div></div>
        </div>
        <span class="lbl">C'est à propos de quoi ? <i>*</i></span>
        <div class="choice">${Object.entries(CATS).map(([k, c]) => `<label class="opt"><input type="radio" name="cat" value="${k}"><span>${ic(c.icon, 20)}<b>${c.label}</b></span></label>`).join('')}</div>
        <div class="row2">
          <div><span class="lbl">Tu es plutôt…</span><div class="seg-in">${Object.entries(PUBLICS).map(([k, l], i) => `<label><input type="radio" name="public" value="${k}" ${i === 2 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
          <div><span class="lbl">Urgence</span><div class="seg-in">${[['non', 'Normale'], ['oui', 'Urgente']].map(([k, l], i) => `<label><input type="radio" name="urg" value="${k}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        </div>
        <label class="lbl" for="qT">Ton problème en une phrase <i>*</i></label>
        <input class="in" id="qT" name="titre" maxlength="90" placeholder="ex. Mon PC portable s'éteint tout seul">
        <div class="similar" id="similar"></div>
        <label class="lbl" for="qX">Détails <span class="muted" id="cnt">0 / 500</span></label>
        <textarea class="in" id="qX" name="texte" rows="5" maxlength="500" placeholder="Marque et modèle, depuis quand, ce qui s'affiche, ce que tu as déjà essayé…"></textarea>
        <p class="err" id="qErr"></p>
        <div class="qbtns"><button class="btn primary big" type="submit">${ic('send', 18)}Envoyer ma question</button><button class="btn wa big" type="button" id="qWa">${ic('whatsapp', 18)}Plutôt sur WhatsApp</button></div>
        <p class="muted small">Seuls ton prénom et ton quartier sont visibles, pour aider d'autres personnes qui ont le même problème.</p>
      </form>
      <aside class="qside">
        <div class="card agent"><img class="agent-ph" src="img/agent.jpg" alt=""><div class="agent-body"><div class="agent-id"><img src="img/av5.jpg" alt=""><div><b>Ryan te répond</b><small><span class="dot-on"></span>En ligne · répond en ~18 min</small></div></div><ul class="checks">${['Explication pas à pas', 'Le bon guide gratuit', 'Une aide payante seulement si tu la demandes'].map((x) => `<li>${ic('check', 15, 2.6)}${x}</li>`).join('')}</ul></div></div>
        <div class="card"><h3>Mes questions</h3><div id="mesQ">${mesQuestionsHtml()}</div></div>
        <a class="card forum-cta" href="#/forum"><span class="cat-ic">${ic('users', 22)}</span><div><b>Questions de la communauté</b><small>${S.questions.length} questions · ${S.questions.filter((q) => q.statut !== 'attente').length} avec réponse</small></div>${ic('arrow', 18)}</a>
      </aside>
    </div>`;
  function mesQuestionsHtml() {
    const mine = S.questions.filter((q) => S.mesQuestions.includes(q.id));
    if (!mine.length) return `<p class="muted small empty-s">${ic('inbox', 20)}Tu n'as encore posé aucune question.</p>`;
    return mine.map((q) => `<a class="mq" href="#/forum/${q.id}"><b>${esc(q.titre)}</b>${statutBadge(q.statut)}</a>`).join('');
  }

  pages.forum = (id) => {
    if (id) return forumDetail(id);
    const f = AMD.forumFiltre || 'tous';
    const list = S.questions.filter((q) => f === 'tous' || q.cat === f || q.public === f).sort((a, b) => b.date - a.date || b.votes - a.votes);
    return `<div class="page-head row"><div><span class="eyebrow">Communauté</span><h1>Questions de la communauté</h1><p>Chaque réponse aide aussi les suivants. Vote pour les questions utiles.</p></div><a class="btn primary" href="#/question">${ic('help', 18)}Poser une question</a></div>
      <div class="filters">${[['tous', 'Tout'], ['etudiant', 'Étudiants'], ['commercant', 'Commerçants'], ...Object.entries(CATS).map(([k, c]) => [k, c.label])].map(([k, l]) => `<button class="fchip ${f === k ? 'on' : ''}" data-ff="${k}">${l}</button>`).join('')}</div>
      <div class="qlist">${list.map((q) => `<a class="qitem" href="#/forum/${q.id}"><div class="vote ${S.votes[q.id] ? 'on' : ''}" data-vote="${q.id}" role="button" aria-label="Voter pour cette question">${ic('chevron', 18, 2.4, 'up')}<b>${q.votes + (S.votes[q.id] ? 1 : 0)}</b></div><div class="qmain"><div class="qtop">${catBadge(q.cat)}${statutBadge(q.statut)}${S.mesQuestions.includes(q.id) ? '<span class="st mine">Ma question</span>' : ''}</div><h3>${esc(q.titre)}</h3><div class="qmeta"><span class="mini-av">${initials(q.nom)}</span>${esc(q.nom)} · ${esc(q.quartier)} · ${dayLabel(q.date)}<span class="qcount">${ic('message', 14)}${q.reponses.length}</span></div></div></a>`).join('') || '<p class="muted">Aucune question dans cette catégorie.</p>'}</div>`;
  };
  function forumDetail(id) {
    const q = S.questions.find((x) => x.id === id);
    if (!q) return '<p>Question introuvable.</p>';
    const art = ARTICLES.find((a) => a.cat === q.cat);
    const off = OFFRES.find((o) => o.cat === q.cat && o.id !== 'vip') || OFFRES[1];
    return `<a class="back" href="#/forum">${ic('arrowLeft', 16)}Toutes les questions</a>
      <div class="detail-grid">
        <article class="card qdetail">
          <div class="qtop">${catBadge(q.cat)}${statutBadge(q.statut)}<span class="muted small">${q.id}</span></div>
          <h1>${esc(q.titre)}</h1>
          <div class="qmeta"><span class="mini-av">${initials(q.nom)}</span>${esc(q.nom)} · ${ic('pin', 13)}${esc(q.quartier)} · ${dayLabel(q.date)}</div>
          ${q.texte ? `<p class="qtxt">${esc(q.texte)}</p>` : ''}
          <h4 class="ans-h">${q.reponses.length} réponse${q.reponses.length > 1 ? 's' : ''}</h4>
          <div class="answers">${q.reponses.map((r) => `<div class="ans ${r.equipe ? 'team' : ''}">${r.equipe ? '<img class="ans-av" src="img/av5.jpg" alt="">' : `<span class="ans-av">${initials(r.par)}</span>`}<div><div class="ans-top"><b>${esc(r.par)}</b>${r.equipe ? '<span class="team-tag">Équipe Aide-moi</span>' : ''}<small>${dayLabel(r.date)}</small></div><p>${esc(r.texte)}</p></div></div>`).join('') || `<div class="wait-box"><div class="spin sm"></div><p>Ryan prépare ta réponse. Elle s'affichera ici automatiquement.</p></div>`}</div>
          <form class="reply" id="replyForm"><input class="in" name="r" placeholder="Ajouter un commentaire ou un merci…" aria-label="Commentaire"><button class="btn primary">${ic('send', 16)}Publier</button></form>
          ${q.statut !== 'resolu' && S.mesQuestions.includes(q.id) && q.reponses.length ? `<button class="btn ghost" data-resolve="${q.id}">${ic('checkCircle', 17)}Mon problème est résolu</button>` : ''}
        </article>
        <aside class="detail-side">
          ${art ? `<a class="card up-art" href="#/blog/${art.id}"><img src="${art.img}" alt=""><div><small>Guide gratuit lié</small><b>${esc(art.titre)}</b><span class="link">Lire ${ic('arrow', 14)}</span></div></a>` : ''}
          <div class="card up-pay"><small>Toujours bloqué ?</small><div class="up-row"><span class="cat-ic">${ic(off.icon, 22)}</span><b>${esc(off.titre)}</b></div><div class="up-price">${prixTxt(off)}</div><button class="btn primary full" data-buy="${off.id}">On le fait pour toi</button></div>
        </aside>
      </div>`;
  }

  pages.solutions = () => {
    const f = AMD.solFiltre || 'tous';
    const list = OFFRES.filter((o) => f === 'tous' || o.public === f || o.public === 'tous');
    return `<section class="sol-hero"><div><span class="eyebrow">Aide payante</span><h1>Quand l'aide gratuite ne suffit pas, on s'en occupe.</h1><p>Des prix fixes en FCFA, annoncés avant de commencer. Paiement Orange Money, MTN MoMo ou après le service.</p>
        <div class="seg">${[['tous', 'Tout le monde'], ['etudiant', 'Étudiants'], ['commercant', 'Commerçants']].map(([k, l]) => `<button class="${f === k ? 'on' : ''}" data-sf="${k}">${l}</button>`).join('')}</div></div>
        <div class="sol-photos"><img src="img/rep-laptop.jpg" alt="Réparation d'un ordinateur portable"><img src="img/rep-phone.jpg" alt="Réparation d'un smartphone"></div></section>
      <div class="offres">${list.map((o) => `<article class="offre ${o.populaire ? 'popu' : ''} ${o.id === 'vip' ? 'vip' : ''}">${o.populaire ? '<span class="ribbon">Le plus demandé</span>' : ''}<div class="o-top"><span class="o-ic">${ic(o.icon, 22)}</span><span class="o-public">${PUBLICS[o.public]}</span></div><h3>${esc(o.titre)}</h3><div class="o-prix">${prixTxt(o)}</div><small class="o-delai">${ic('clock', 14)}${o.delai}</small><ul>${o.points.map((p) => `<li>${ic('check', 15, 2.6)}${esc(p)}</li>`).join('')}</ul>
        ${o.id === 'vip' && S.vip ? `<span class="btn white full">${ic('checkCircle', 18)}Déjà VIP</span>` : `<button class="btn ${o.id === 'vip' ? 'white' : o.populaire ? 'primary' : 'soft'} full" data-buy="${o.id}">${o.id === 'formation' ? 'Accéder à la formation' : o.id === 'vip' ? 'Devenir VIP' : 'Commander'}</button>`}
        <a class="o-wa" target="_blank" rel="noopener" href="${waLink(`Bonjour, je suis intéressé(e) par : ${o.titre}`)}">${ic('whatsapp', 15)}Poser une question sur WhatsApp</a></article>`).join('')}</div>
      <section class="block remote">
        <img src="img/rep-pc.jpg" alt="Technicien intervenant sur un ordinateur">
        <div>${sectionHead('Dépannage à distance', 'Comment se passe une intervention ?', '')}
          <ol class="steps sm">${[['Tu commandes et tu paies', 'Mobile Money ou après le service.'], ['Ryan t\'appelle sur WhatsApp', 'Il t\'aide à installer AnyDesk, gratuit et sécurisé.'], ['Tu regardes, il répare', 'Tu vois tout ce qu\'il fait et tu peux couper à tout moment.']].map(([t, d], i) => `<li><span>${i + 1}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol></div>
      </section>
      <section class="guarantee"><span class="g-ic">${ic('shield', 28)}</span><div><h3>Satisfait ou remboursé</h3><p>Si on n'arrive pas à régler ton problème, tu ne paies rien. On ne te demandera jamais ton code Mobile Money ni tes mots de passe.</p></div></section>
      <section class="block faq">${sectionHead('FAQ', 'Questions fréquentes', '')}
        ${[['Comment marche le dépannage à distance ?', 'Tu installes un petit logiciel gratuit (AnyDesk), tu donnes le code affiché, et Ryan travaille sur ton PC pendant que tu regardes. Tu peux couper à tout moment.'],
          ['C\'est sécurisé ?', 'Ryan ne voit que ce que tu montres, la connexion se coupe à la fin, et aucun mot de passe ni code Mobile Money ne t\'est demandé.'],
          ['Et si je n\'ai pas d\'ordinateur ?', 'Les CV et les conseils se font sur téléphone. Pour les pannes matérielles, on t\'oriente vers une boutique partenaire de confiance.'],
          ['Je suis étudiant, il y a une réduction ?', 'Le CV à 3 000 FCFA et la formation à 10 000 FCFA sont pensés pour les étudiants. Les VIP ont -20 % sur le reste.']].map(([q, r]) => `<details><summary>${q}${ic('chevron', 18)}</summary><p>${r}</p></details>`).join('')}
      </section>`;
  };

  pages.blog = (id) => {
    if (id) return article(id);
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    const cat = params.get('cat') || 'tous';
    const list = ARTICLES.filter((a) => cat === 'tous' || a.cat === cat);
    const feat = cat === 'tous' ? ARTICLES[1] : null;
    return `<div class="page-head row"><div><span class="eyebrow">Blog d'aide</span><h1>Des guides qui règlent vraiment le problème</h1><p>10 guides gratuits, testés, en français simple.</p></div><div class="search sm"><span class="s-ic">${ic('search', 18)}</span><input id="blogQ" placeholder="Rechercher un guide…" aria-label="Rechercher un guide"></div></div>
      <div class="filters">${[['tous', 'Tous'], ...Object.entries(CATS).map(([k, c]) => [k, c.label])].map(([k, l]) => `<a class="fchip ${cat === k ? 'on' : ''}" href="#/blog${k === 'tous' ? '' : '?cat=' + k}">${l}</a>`).join('')}</div>
      ${feat ? `<a class="feat" href="#/blog/${feat.id}"><img src="${feat.img}" alt=""><div class="feat-txt"><span class="eyebrow light">Le plus lu</span><h2>${esc(feat.titre)}</h2><p>${esc(feat.intro)}</p><span class="btn white">Lire le guide ${ic('arrow', 16)}</span></div></a>` : ''}
      <div class="arts" id="blogList">${list.filter((a) => a !== feat).map(artCard).join('')}</div>`;
  };
  function article(id) {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) return '<p>Article introuvable.</p>';
    const off = OFFRES.find((o) => o.cat === a.cat && o.id !== 'vip') || OFFRES[1];
    const autres = ARTICLES.filter((x) => x.id !== id && x.cat === a.cat).concat(ARTICLES.filter((x) => x.cat !== a.cat)).slice(0, 3);
    const u = S.utile[id];
    return `<a class="back" href="#/blog">${ic('arrowLeft', 16)}Tous les guides</a>
      <article class="post">
        <header class="post-head"><img src="${a.img}" alt=""><div class="post-shade"></div><div class="post-title">${catBadge(a.cat)}<h1>${esc(a.titre)}</h1><div class="post-meta"><img src="img/av5.jpg" alt=""><span>Par <b>Ryan</b> · ${a.min} min de lecture · ${a.vues.toLocaleString('fr-FR')} lectures</span></div></div></header>
        <div class="post-grid">
          <div>
            <p class="post-intro">${esc(a.intro)}</p>
            <div class="progress-steps" id="ps"><span>0 sur ${a.etapes.length} étapes faites</span><div class="pbar"><i style="width:0"></i></div></div>
            <ol class="etapes">${a.etapes.map(([t, d], i) => `<li><label class="et"><input type="checkbox" data-step="${i}"><span class="num">${i + 1}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div><span class="et-check">${ic('check', 16, 3)}</span></label></li>`).join('')}</ol>
            <div class="helpful" id="helpful">${u ? `<p>${ic('checkCircle', 18)}Merci pour ton retour.</p>` : `<p>Ce guide t'a aidé ?</p><button class="btn ghost sm" data-help="oui">${ic('thumbUp', 16)}Oui</button><button class="btn ghost sm" data-help="non">${ic('thumbDown', 16)}Non</button>`}</div>
          </div>
          <aside class="post-side">
            <div class="card up-pay sticky"><small>Toujours bloqué après ces étapes ?</small><div class="up-row"><span class="cat-ic">${ic(off.icon, 22)}</span><b>${esc(off.titre)}</b></div><div class="up-price">${prixTxt(off)}</div><small class="muted">${ic('clock', 13)} ${off.delai}</small><button class="btn primary full" data-buy="${off.id}">On le fait pour toi</button><a class="btn wa full" target="_blank" rel="noopener" href="${waLink(`Bonjour, j'ai suivi le guide « ${a.titre} » mais je suis toujours bloqué.`)}">${ic('whatsapp', 17)}WhatsApp</a></div>
          </aside>
        </div>
      </article>
      ${sponsor()}
      <section class="block">${sectionHead('À lire aussi', 'Guides similaires', '')}<div class="arts">${autres.map(artCard).join('')}</div></section>`;
  }

  /* Espace Ryan : suivi de l'activité et simulateur de revenus (pour la présentation) */
  pages.espace = () => {
    const ca = S.commandes.reduce((s, c) => s + c.prix, 0);
    const attente = S.questions.filter((q) => q.statut === 'attente');
    const kpi = (icn, l, v, s, cls = '') => `<div class="kpi ${cls}"><span class="kpi-ic">${ic(icn, 20)}</span><small>${l}</small><b>${v}</b><span>${s}</span></div>`;
    return `<div class="page-head row"><div><span class="eyebrow">Gestion</span><h1>Espace Ryan</h1><p>Tableau de bord de l'activité · données de démonstration</p></div><button class="btn ghost" data-reset>${ic('refresh', 17)}Réinitialiser la démo</button></div>
      <div class="kpis">
        ${kpi('users', 'Visites ce mois', S.visites.toLocaleString('fr-FR'), '62 % arrivent par TikTok')}
        ${kpi('inbox', 'Questions reçues', S.questions.length, `${attente.length} en attente de réponse`)}
        ${kpi('receipt', 'Commandes', S.commandes.length, `${S.commandes.filter((c) => c.statut === 'payé').length} payées`)}
        ${kpi('wallet', 'Chiffre d\'affaires', fcfa(ca + (S.sponsorActif ? AMD.SPONSOR.tarif : 0)), `dont publicité : ${S.sponsorActif ? fcfa(AMD.SPONSOR.tarif) : '—'}`, 'green')}
      </div>
      <div class="esp-grid">
        <section class="card"><h3>${ic('inbox', 19)}Questions à traiter</h3>${attente.length ? attente.map((q) => `<div class="todo"><div class="todo-top">${catBadge(q.cat)}<small>${esc(q.nom)} · ${esc(q.quartier)}</small></div><b>${esc(q.titre)}</b><form class="ansform" data-ans="${q.id}"><input class="in" placeholder="Ta réponse…" required aria-label="Réponse"><button class="btn primary">Répondre</button></form></div>`).join('') : `<p class="muted empty-s">${ic('checkCircle', 20)}Toutes les questions ont une réponse.</p>`}</section>
        <section class="card"><h3>${ic('receipt', 19)}Dernières commandes</h3>${S.commandes.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Réf.</th><th>Client</th><th>Offre</th><th>Montant</th><th>Statut</th></tr>${S.commandes.slice(0, 8).map((c) => `<tr><td>${c.ref}</td><td>${esc(c.nom)}</td><td>${esc(c.titre)}</td><td>${fcfa(c.prix)}</td><td><span class="st ${c.statut === 'payé' ? 'ok' : 'wait'}">${c.statut}</span></td></tr>`).join('')}</table></div>` : `<p class="muted empty-s">${ic('receipt', 20)}Aucune commande pour l'instant. Commande une offre depuis « Solutions » pour la voir ici.</p>`}
          <div class="pubctl"><span class="cat-ic">${ic('megaphone', 20)}</span><div><b>Publicité locale</b><small>${esc(AMD.SPONSOR.nom)} · ${fcfa(AMD.SPONSOR.tarif)} / mois · ${S.pubClics} clics</small></div><label class="switch"><input type="checkbox" id="pubSw" ${S.sponsorActif ? 'checked' : ''} aria-label="Afficher la publicité"><i></i></label></div></section>
      </div>
      <section class="card sim"><h3>${ic('chart', 19)}Simulateur de revenus mensuels</h3><p class="muted">On aide gratuitement → les gens font confiance → une partie paie.</p>
        <div class="sim-grid">
          <div class="sliders">
            ${[['vis', 'Visiteurs par mois', 200, 5000, 50, 1000], ['ask', 'Posent une question', 1, 30, 1, 10], ['pay', 'Questions qui deviennent clientes', 5, 50, 1, 20], ['pan', 'Panier moyen (FCFA)', 3000, 15000, 500, 7500], ['vip', 'Abonnés VIP', 0, 50, 1, 4], ['pub', 'Boutiques partenaires (pub)', 0, 5, 1, 1]].map(([k, l, mn, mx, st, v]) => `<label class="sl"><span>${l} <b data-o="${k}">${v}</b></span><input type="range" data-s="${k}" min="${mn}" max="${mx}" step="${st}" value="${v}"></label>`).join('')}
          </div>
          <div class="funnel" id="funnel"></div>
        </div></section>`;
  };
  function simulate() {
    const g = (k) => Number($(`[data-s="${k}"]`).value);
    ['vis', 'ask', 'pay', 'pan', 'vip', 'pub'].forEach((k) => { $(`[data-o="${k}"]`).textContent = (k === 'ask' || k === 'pay' ? g(k) + ' %' : g(k).toLocaleString('fr-FR')); });
    const vis = g('vis'), q = Math.round((vis * g('ask')) / 100), p = Math.round((q * g('pay')) / 100);
    const dep = p * g('pan'), vip = g('vip') * 5000, pub = g('pub') * 20000, tot = dep + vip + pub;
    $('#funnel').innerHTML = `
      <div class="fl" style="width:100%"><b>${vis.toLocaleString('fr-FR')}</b><span>visiteurs</span></div>
      <div class="fl f2" style="width:${Math.max(40, Math.min(90, 40 + g('ask') * 2))}%"><b>${q}</b><span>questions (aide gratuite)</span></div>
      <div class="fl f3" style="width:${Math.max(26, Math.min(70, 20 + g('pay')))}%"><b>${p}</b><span>clients payants</span></div>
      <ul class="rev"><li><span>Dépannages, CV, formations</span><b>${fcfa(dep)}</b></li><li><span>Abonnements VIP</span><b>${fcfa(vip)}</b></li><li><span>Publicité locale</span><b>${fcfa(pub)}</b></li></ul>
      <div class="total"><span>Total estimé par mois</span><b>${fcfa(tot)}</b></div>`;
  }

  /* ---------------- routeur ---------------- */
  const NAV = [['accueil', 'Accueil', 'home'], ['question', 'Poser une question', 'help'], ['solutions', 'Solutions', 'wrench'], ['blog', 'Blog d\'aide', 'book']];
  function renderChrome() {
    const cur = (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]) || 'accueil';
    const on = (k) => cur === k || (k === 'question' && cur === 'forum');
    $('#nav').innerHTML = NAV.map(([k, l]) => `<a href="#/${k === 'accueil' ? '' : k}" class="${on(k) ? 'on' : ''}">${l}</a>`).join('');
    $('#bnav').innerHTML = NAV.map(([k, l, i]) => `<a href="#/${k === 'accueil' ? '' : k}" class="${on(k) ? 'on' : ''}">${ic(i, 21)}<span>${l.replace('Poser une question', 'Question').replace('Blog d\'aide', 'Blog')}</span></a>`).join('');
    $('#vipTag').hidden = !S.vip;
  }
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path] = h.split('?');
    const [page, id] = path.split('/');
    const p = pages[page || 'accueil'] ? page || 'accueil' : 'accueil';
    const main = $('#main');
    main.innerHTML = pages[p](id);
    main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter');
    renderChrome();
    window.scrollTo(0, 0);
    document.title = `${{ accueil: 'Aide informatique gratuite', question: 'Poser une question', forum: 'Communauté', solutions: 'Solutions', blog: 'Blog d\'aide', espace: 'Espace Ryan' }[p]} · Aide-moi Douala`;
    if (p === 'espace') { $$('[data-s]').forEach((r) => r.addEventListener('input', simulate)); simulate(); }
  }

  /* ---------------- interactions ---------------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    const buy = t.closest('[data-buy]'); if (buy) { e.preventDefault(); return commander(buy.dataset.buy); }
    const vid = t.closest('[data-video]'); if (vid) return playVideo(vid.dataset.video);
    const sfset = t.closest('[data-sfset]'); if (sfset) AMD.solFiltre = sfset.dataset.sfset;
    const vote = t.closest('[data-vote]');
    if (vote) { e.preventDefault(); const id = vote.dataset.vote; S.votes[id] = !S.votes[id]; save(); vote.classList.toggle('on', S.votes[id]); const q = S.questions.find((x) => x.id === id); vote.querySelector('b').textContent = q.votes + (S.votes[id] ? 1 : 0); return; }
    const ff = t.closest('[data-ff]'); if (ff) { AMD.forumFiltre = ff.dataset.ff; return route(); }
    const sf = t.closest('[data-sf]'); if (sf) { AMD.solFiltre = sf.dataset.sf; return route(); }
    const help = t.closest('[data-help]');
    if (help) { const id = location.hash.split('/')[2]; S.utile[id] = help.dataset.help; save(); $('#helpful').innerHTML = `<p>${ic('checkCircle', 18)}Merci pour ton retour.</p>`; toast('Merci, ton avis aide les autres lecteurs.'); return; }
    const res = t.closest('[data-resolve]');
    if (res) { const q = S.questions.find((x) => x.id === res.dataset.resolve); q.statut = 'resolu'; save(); toast('Question marquée comme résolue.'); return route(); }
    if (t.closest('[data-pub]')) { S.pubClics++; save(); modal(`<div class="pubm"><span class="sp-tag">Annonce</span><div class="sp-logo big">IP</div><h3>${esc(AMD.SPONSOR.nom)}</h3><p>${esc(AMD.SPONSOR.texte)}</p><p class="muted">${ic('pin', 14)} ${esc(AMD.SPONSOR.lieu)} · Lun–Sam, 8 h–19 h</p><p class="demo-note">Boutique fictive. Une boutique paie ${fcfa(AMD.SPONSOR.tarif)} par mois pour cet emplacement.</p></div>`, 'sm'); return; }
    if (t.closest('[data-reset]')) { if (confirm('Remettre toutes les données de démonstration à zéro ?')) { localStorage.removeItem(KEY); S = fresh(); save(); toast('Démo réinitialisée.', 'info'); route(); } return; }
    if (t.id === 'qWa' || t.closest('#qWa')) {
      const f = $('#qForm');
      window.open(waLink(`Bonjour Aide-moi Douala ! Je suis ${f.nom.value || '…'} (${f.quartier.value}). Mon problème : ${f.titre.value || '…'}. ${f.texte.value}`), '_blank', 'noopener');
    }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'heroSearch') {
      e.preventDefault();
      const q = norm(f.q.value.trim());
      if (!q) return f.q.focus();
      const hit = ARTICLES.find((a) => norm(a.titre + ' ' + a.intro).split(/\W+/).some((w) => w.length > 3 && q.includes(w)));
      if (hit) location.hash = '#/blog/' + hit.id;
      else { toast('Pas encore de guide sur ce sujet : pose ta question, on te répond.', 'info'); const v = f.q.value; location.hash = '#/question'; setTimeout(() => { const i = $('[name=titre]'); if (i) i.value = v; }, 50); }
    }
    if (f.id === 'qForm') {
      e.preventDefault();
      const err = $('#qErr');
      const v = { nom: f.nom.value.trim(), quartier: f.quartier.value, cat: f.cat.value, public: f.public.value, titre: f.titre.value.trim(), texte: f.texte.value.trim(), urg: f.urg.value };
      if (!v.nom) { err.textContent = 'Indique ton prénom.'; return f.nom.focus(); }
      if (!v.cat) { err.textContent = 'Choisis le type de problème.'; return; }
      if (v.titre.length < 10) { err.textContent = 'Décris ton problème en une phrase (10 caractères minimum).'; return f.titre.focus(); }
      if (!S.vip && S.mesQuestions.length >= 3) { err.innerHTML = 'Tu as atteint la limite de 3 questions gratuites. <a href="#/solutions" class="link">Passe VIP</a> pour des questions illimitées.'; return; }
      err.textContent = '';
      const id = 'Q-' + (1043 + S.questions.length);
      S.questions.unshift({ id, ...v, date: 0, votes: 0, statut: 'attente', reponses: [] });
      S.mesQuestions.push(id);
      save();
      toast('Question envoyée. Réponse en moins de 2 h (ici : quelques secondes).');
      location.hash = '#/forum/' + id;
      setTimeout(() => {
        const q = S.questions.find((x) => x.id === id);
        if (!q || q.reponses.length) return;
        const art = ARTICLES.find((a) => a.cat === q.cat);
        const off = OFFRES.find((o) => o.cat === q.cat && o.id !== 'vip') || OFFRES[1];
        q.reponses.push({ par: 'Ryan', equipe: true, date: 0, texte: `Salut ${q.nom}, merci pour ta question. Commence par le guide gratuit « ${art.titre} » : il règle la plupart des cas. Si tu es toujours bloqué(e), je peux m'en occuper pour toi (${off.titre}, ${off.prix.toLocaleString('fr-FR')} FCFA).${q.urg === 'oui' ? ' Comme c\'est urgent, écris-moi directement sur WhatsApp.' : ''}` });
        q.statut = 'repondu';
        save();
        toast(`Ryan a répondu à ta question « ${esc(q.titre)} »`, 'info');
        if (location.hash === '#/forum/' + id || location.hash.startsWith('#/question')) route();
      }, 5000);
    }
    if (f.id === 'replyForm') {
      e.preventDefault();
      const txt = f.r.value.trim();
      if (!txt) return;
      const id = location.hash.split('/')[2];
      const q = S.questions.find((x) => x.id === id);
      q.reponses.push({ par: (S.questions.find((x) => S.mesQuestions.includes(x.id)) || {}).nom || 'Visiteur', date: 0, texte: txt });
      save(); route(); toast('Commentaire publié.');
    }
    if (f.matches('[data-ans]')) {
      e.preventDefault();
      const q = S.questions.find((x) => x.id === f.dataset.ans);
      q.reponses.push({ par: 'Ryan', equipe: true, date: 0, texte: f.querySelector('input').value.trim() });
      q.statut = 'repondu'; save(); toast('Réponse publiée sur le forum.'); route();
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.name === 'texte' && $('#cnt')) $('#cnt').textContent = `${t.value.length} / 500`;
    if (t.name === 'titre' && $('#similar')) {
      const q = norm(t.value);
      const hits = q.length < 4 ? [] : ARTICLES.filter((a) => norm(a.titre + ' ' + a.intro).split(/\W+/).some((w) => w.length > 3 && q.includes(w))).slice(0, 2);
      $('#similar').innerHTML = hits.length ? `<p>${ic('sparkles', 15)}Ces guides gratuits peuvent déjà t'aider :</p>${hits.map((a) => `<a href="#/blog/${a.id}">${ic(CATS[a.cat].icon, 15)}${esc(a.titre)}</a>`).join('')}` : '';
    }
    if (t.name === 'q' && t.closest('#heroSearch')) {
      const q = norm(t.value);
      const hits = q.length < 3 ? [] : ARTICLES.filter((a) => norm(a.titre + ' ' + a.intro).includes(q) || norm(a.titre).split(/\W+/).some((w) => w.length > 3 && q.includes(w))).slice(0, 4);
      $('#suggest').innerHTML = hits.length ? `<span>Guides :</span>${hits.map((a) => `<a href="#/blog/${a.id}">${esc(a.titre)}</a>`).join('')}` : `<span>Populaire :</span>${[['PC lent', 'pc-lent'], ['Clé USB', 'cle-usb-raccourcis'], ['Virus', 'virus-5-minutes'], ['CV', 'cv-word-20-minutes'], ['Excel', 'excel-5-formules']].map(([l, id]) => `<a href="#/blog/${id}">${l}</a>`).join('')}`;
    }
    if (t.id === 'blogQ') {
      const q = norm(t.value);
      const list = ARTICLES.filter((a) => norm(a.titre + ' ' + a.intro + ' ' + a.etapes.flat().join(' ')).includes(q));
      const feat = $('.feat'); if (feat) feat.hidden = !!q;
      $('#blogList').innerHTML = list.map(artCard).join('') || '<p class="muted">Aucun guide trouvé. <a class="link" href="#/question">Pose ta question</a>.</p>';
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-step]')) {
      const all = $$('[data-step]'), done = all.filter((x) => x.checked).length;
      $('#ps span').textContent = `${done} sur ${all.length} étapes faites`;
      $('#ps .pbar i').style.width = (done / all.length) * 100 + '%';
      t.closest('li').classList.toggle('done', t.checked);
      if (done === all.length) toast('Bravo, tu as fait toutes les étapes.');
    }
    if (t.id === 'pubSw') { S.sponsorActif = t.checked; save(); toast(t.checked ? 'Publicité affichée sur le site.' : 'Publicité retirée du site.', 'info'); route(); }
  });

  // en-tête : logo + ombre au défilement
  $$('[data-logo]').forEach((el) => { el.innerHTML = AMD.logo(el.dataset.logo === 'dark'); });
  const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('hashchange', route);
  route(); onScroll();
})();

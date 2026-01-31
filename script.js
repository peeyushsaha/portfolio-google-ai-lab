
// Configuration
const GOOGLE_FORM_URL = "PASTE_GOOGLE_FORM_LINK_HERE";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Profile Data
    loadProfile();

    // 2. Theme Toggle
    initTheme();

    // 3. Scroll Reveal Animation
    initScrollReveal();

    // 4. Navbar Active State
    initNavbar();

    // 5. Contact Form Handler
    initContact();
});

async function loadProfile() {
    try {
        const response = await fetch('./profile.json');
        if (!response.ok) throw new Error('Failed to load profile');
        const profile = await response.json();
        
        // Populate DOM
        updateHero(profile);
        updateAbout(profile);
        updateSkills(profile.skills);
        updateExperience(profile.experience, profile.education);
        updateProjects(profile.projects);
        updateCertifications(profile.certifications);
        updateSocials(profile.links);

    } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback or Alert? 
        // We'll leave the static HTML placeholders if JS fails, but we made them empty so...
        // Let's manually show some error state if needed, but per instructions, "ensure site does not break if some data is missing"
    }
}

function updateHero(data) {
    if(data.name) document.querySelector('.hero-name').textContent = data.name;
    if(data.headline) document.querySelector('.hero-headline').textContent = data.headline;
    if(data.location) document.querySelector('.hero-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.location}`;
}

function updateAbout(data) {
    if(data.about) {
        document.getElementById('about-text').textContent = data.about;
    }
}

function updateSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!skills || skills.length === 0) {
        container.innerHTML = '<p>No skills listed.</p>';
        return;
    }
    
    container.innerHTML = skills.map(skill => `
        <span class="skill-pill fade-in">${skill}</span>
    `).join('');
}

function updateExperience(experience, education) {
    const container = document.getElementById('experience-container');
    // Combine and sort by date if possible, but for now we'll just stack them.
    // Let's label them.
    let expHTML = '';

    // Education
    if(education && education.length > 0) {
        education.forEach(edu => {
            expHTML += `
                <div class="exp-card scroll-reveal">
                    <h3 class="exp-title">${edu.title}</h3>
                    <div class="exp-company">${edu.company}</div>
                    <div class="exp-date">${edu.dates}</div>
                </div>
            `;
        });
    }

    // Experience
    if(experience && experience.length > 0) {
        experience.forEach(job => {
            expHTML += `
                <div class="exp-card scroll-reveal">
                    <h3 class="exp-title">${job.title}</h3>
                    <div class="exp-company">${job.company}</div>
                    <div class="exp-date">${job.dates}</div>
                    <ul class="exp-bullets">
                        ${job.bullets.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
            `;
        });
    }

    container.innerHTML = expHTML || '<p>No experience listed.</p>';
}

function updateProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="project-card scroll-reveal">
                <div class="project-content">
                    <h3 class="project-title">Project Coming Soon</h3>
                    <p class="project-desc">I am currently working on some exciting projects. Check back later!</p>
                    <div class="project-tags">
                        <span class="tag">TODO</span>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map(proj => `
        <div class="project-card scroll-reveal">
            <div class="project-content">
                <h3 class="project-title">${proj.name}</h3>
                <p class="project-desc">${proj.description}</p>
                <div class="project-tags">
                    ${proj.tech.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
                ${proj.link ? `<a href="${proj.link}" target="_blank" class="btn secondary-btn">View Project</a>` : ''}
            </div>
        </div>
    `).join('');
}

function updateCertifications(certs) {
    const container = document.getElementById('cert-container');
    if (!certs || certs.length === 0) return;

    container.innerHTML = certs.map(cert => `
        <li class="cert-item scroll-reveal">
            <i class="fas fa-certificate cert-icon"></i> <span>${cert}</span>
        </li>
    `).join('');
}

function updateSocials(links) {
    const container = document.getElementById('social-container');
    const mapping = {
        linkedin: 'fab fa-linkedin',
        instagram: 'fab fa-instagram',
        topmate: 'fas fa-link', // No fontawesome topmate, generic link
        github: 'fab fa-github'
    };

    let html = '';
    for (const [key, url] of Object.entries(links)) {
        if (url && url.length > 0) {
            html += `<a href="${url}" target="_blank" class="social-link" aria-label="${key}"><i class="${mapping[key] || 'fas fa-link'}"></i></a>`;
        }
    }
    container.innerHTML = html;
}

// Interactive Features
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = toggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    toggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        if (isDark) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // Observe elements only after they are added to DOM, so we might need a MutationObserver or just wait/timeout?
    // Good practice: use a mutation observer or re-query. For simplicity, we'll re-query after a slight delay or make the profile loader trigger this.
    // Actually, let's just observe the static ones now, and dynamic ones inside the render functions.
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    
    // We'll expose `observe` to the global scope or re-run it in loadProfile
    window.observeNewElements = () => {
        document.querySelectorAll('.scroll-reveal:not(.visible)').forEach(el => observer.observe(el));
    };
    
    // Quick hack: periodically check or just call it after loadProfile
    setTimeout(window.observeNewElements, 1000); 
}

function initNavbar() {
    // Sticky highlight
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });
    });

    // Mobile Menu
    const burger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-links');
    
    if(burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

function initContact() {
    const btn = document.getElementById('contact-google-form-btn');
    const container = document.getElementById('form-container');

    btn.addEventListener('click', () => {
        if (GOOGLE_FORM_URL.includes('docs.google.com/forms')) {
            // Embed iframe if valid form URL
            container.innerHTML = `<iframe src="${GOOGLE_FORM_URL}?embedded=true" width="100%" height="800" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`;
            // Also open in new tab as per requirement: "Must open the Google Form in a NEW TAB... Embed iframe ONLY if..."
            // Wait, requirement says: "Contact Me" button must open the Google Form in a NEW TAB
            // AND "Embed iframe ONLY if the URL contains docs.google.com/forms"
            // This is slightly contradictory or implies multiple options. 
            // "Contact Me button must open...". I have two buttons. One in nav, one in hero, one in contact section.
            // Let's make the main button open in new tab.
            window.open(GOOGLE_FORM_URL, '_blank');
        } else {
            // Fallback
            alert("Please paste a valid Google Form URL in script.js");
        }
    });
}

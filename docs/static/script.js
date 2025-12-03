document.addEventListener('DOMContentLoaded', () => {
    // --- Video Hover Logic ---
    const profileContainer = document.querySelector('.profile-container');
    const profileVideo = document.querySelector('.profile-video');

    if (profileContainer && profileVideo) {
        // Ensure video plays on load (autoplay fallback)
        const playPromise = profileVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Autoplay prevented:', error);
            });
        }

        profileContainer.addEventListener('mouseenter', () => {
            profileVideo.pause();
        });

        profileContainer.addEventListener('mouseleave', () => {
            const playPromise = profileVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Resume play failed:', error);
                });
            }
        });
    }

    // --- Custom Cursor Logic ---
    const cursor = document.createElement('div');
    cursor.classList.add('cursor');
    document.body.appendChild(cursor);

    const follower = document.createElement('div');
    follower.classList.add('cursor-follower');
    document.body.appendChild(follower);

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let hasMoved = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!hasMoved) {
            hasMoved = true;
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
            followerX = mouseX;
            followerY = mouseY;
        }

        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    function animate() {
        const speed = 0.15;
        followerX += (mouseX - followerX) * speed;
        followerY += (mouseY - followerY) * speed;

        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animate);
    }
    animate();

    // --- Magnetic Background Box Effect ---
    // Exclude .dock-item from magnetic effects
    const magneticLinks = document.querySelectorAll('a:not(.dock-item):not(.post-card), .magnetic-btn');

    magneticLinks.forEach(link => {
        // Inject hover box
        const box = document.createElement('span');
        box.classList.add('hover-box');
        link.appendChild(box);

        link.addEventListener('mouseenter', () => {
            // Hide follower but keep cursor (dot)
            cursor.style.opacity = '1';
            follower.style.opacity = '0';
        });

        link.addEventListener('mousemove', (e) => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Magnetic pull strength for the box
            const strength = 0.3;
            box.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            box.style.opacity = '1';
        });

        link.addEventListener('mouseleave', () => {
            box.style.transform = 'translate(0, 0)';
            box.style.opacity = '0';

            // Show follower again
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
        });
    });

    // --- Code Block Cursor Logic ---
    const codeBlocks = document.querySelectorAll('pre, code');
    codeBlocks.forEach(block => {
        block.addEventListener('mouseenter', () => {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });
        block.addEventListener('mouseleave', () => {
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
        });
    });

    // --- Copy Code Button & Expand Button ---
    document.querySelectorAll('pre').forEach(pre => {
        // Handle cursor visibility for non-expanded blocks
        pre.addEventListener('mouseenter', () => document.body.classList.add('modal-hover')); // Reuse modal-hover class which hides cursor
        pre.addEventListener('mouseleave', () => document.body.classList.remove('modal-hover'));

        // Wrapper for buttons
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.position = 'absolute';
        buttonWrapper.style.top = '0.5rem';
        buttonWrapper.style.right = '0.5rem';
        buttonWrapper.style.display = 'flex';
        buttonWrapper.style.gap = '0.5rem';
        buttonWrapper.style.opacity = '0';
        buttonWrapper.style.transition = 'opacity 0.2s';
        pre.appendChild(buttonWrapper);

        pre.addEventListener('mouseenter', () => buttonWrapper.style.opacity = '1');
        pre.addEventListener('mouseleave', () => buttonWrapper.style.opacity = '0');

        // Expand Button
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-btn';
        expandBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
        `;
        expandBtn.title = 'Expand Code';
        // Reset absolute positioning for wrapper
        expandBtn.style.position = 'static';
        buttonWrapper.appendChild(expandBtn);

        // Copy Button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        // Reset absolute positioning for wrapper
        copyBtn.style.position = 'static';
        buttonWrapper.appendChild(copyBtn);

        // Copy Logic
        copyBtn.addEventListener('click', async () => {
            const code = pre.querySelector('code');
            if (!code) return;

            const textToCopy = code.innerText;

            try {
                await navigator.clipboard.writeText(textToCopy);
                showSuccess();
            } catch (err) {
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showSuccess();
                } catch (fallbackErr) {
                    console.error('Failed to copy:', fallbackErr);
                    copyBtn.textContent = 'Error';
                }
            }

            function showSuccess() {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }
        });

        // Expand Logic
        expandBtn.addEventListener('click', () => {
            const codeContent = pre.querySelector('code').innerHTML;

            // Create Modal
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'code-modal-overlay';

            const modalContent = document.createElement('div');
            modalContent.className = 'code-modal-content';

            const modalHeader = document.createElement('div');
            modalHeader.className = 'code-modal-header';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'code-modal-close';
            closeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;

            const modalBody = document.createElement('div');
            modalBody.className = 'code-modal-body markdown-body';

            // Handle cursor visibility
            modalBody.addEventListener('mouseenter', () => document.body.classList.add('modal-hover'));
            modalBody.addEventListener('mouseleave', () => document.body.classList.remove('modal-hover'));

            // Wrap in codehilite to ensure syntax highlighting styles apply
            const codeHilite = document.createElement('div');
            codeHilite.className = 'codehilite';

            const modalPre = document.createElement('pre');
            const modalCode = document.createElement('code');
            modalCode.innerHTML = codeContent;

            modalPre.appendChild(modalCode);
            codeHilite.appendChild(modalPre);
            modalBody.appendChild(codeHilite);

            modalHeader.appendChild(closeBtn);
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // Trigger animation
            requestAnimationFrame(() => {
                modalOverlay.classList.add('active');
            });

            // Close Logic
            const closeModal = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modalOverlay);
                }, 300);
            };

            closeBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) closeModal();
            });

            // Escape key
            document.addEventListener('keydown', function escListener(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escListener);
                }
            });
        });
    });

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    // Check saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        if (isLight) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    });

    // --- Cursor Toggle ---
    const cursorToggle = document.getElementById('cursor-toggle');
    const savedCursor = localStorage.getItem('nativeCursor');

    if (savedCursor === 'true') {
        document.body.classList.add('native-cursor');
    }

    cursorToggle.addEventListener('click', () => {
        document.body.classList.toggle('native-cursor');
        const isNative = document.body.classList.contains('native-cursor');
        localStorage.setItem('nativeCursor', isNative);
    });

    // --- Floating TOC ---
    const markdownBody = document.querySelector('.markdown-body');
    if (markdownBody) {
        const headings = markdownBody.querySelectorAll('h2, h3');
        if (headings.length > 0) {
            // Create TOC Container
            const tocContainer = document.createElement('div');
            tocContainer.className = 'toc-container';

            // Toggle Button
            const tocToggle = document.createElement('div');
            tocToggle.className = 'toc-toggle';
            tocToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
            `;
            tocContainer.appendChild(tocToggle);

            // Dropdown
            const tocDropdown = document.createElement('div');
            tocDropdown.className = 'toc-dropdown';
            tocDropdown.innerHTML = '<div class="toc-title">Table of Contents</div>';

            // Create TOC hover box INSIDE dropdown for correct scrolling/clipping
            const tocHoverBox = document.createElement('div');
            tocHoverBox.classList.add('toc-hover-box');
            tocDropdown.appendChild(tocHoverBox);

            const tocList = document.createElement('ul');
            tocList.className = 'toc-list';

            headings.forEach((heading, index) => {
                // Exclude the "Table of Contents" heading itself
                if (heading.textContent.trim().toLowerCase() === 'table of contents') {
                    return;
                }

                // Ensure heading has ID
                if (!heading.id) {
                    heading.id = 'heading-' + index;
                }

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.className = 'toc-link ' + heading.tagName.toLowerCase();
                a.href = '#' + heading.id;
                a.textContent = heading.textContent;

                // Close dropdown on click
                a.addEventListener('click', () => {
                    tocContainer.classList.remove('active');
                });

                // Add magnetic effect logic
                a.addEventListener('mouseenter', (e) => {
                    // Calculate position relative to the dropdown container
                    // This ensures the box moves with scroll and is clipped correctly
                    const linkRect = a.getBoundingClientRect();
                    const containerRect = tocDropdown.getBoundingClientRect();

                    const relativeTop = linkRect.top - containerRect.top + tocDropdown.scrollTop;
                    const relativeLeft = linkRect.left - containerRect.left + tocDropdown.scrollLeft;

                    tocHoverBox.style.width = `${linkRect.width + 20}px`;
                    tocHoverBox.style.height = `${linkRect.height + 12}px`;
                    tocHoverBox.style.top = `${relativeTop - 6}px`;
                    tocHoverBox.style.left = `${relativeLeft - 10}px`;
                    tocHoverBox.style.opacity = '1';

                    // Hide main cursor follower
                    const follower = document.querySelector('.cursor-follower');
                    const cursor = document.querySelector('.cursor');
                    if (follower) follower.style.opacity = '0';
                    if (cursor) cursor.style.opacity = '1';
                });

                a.addEventListener('mouseleave', () => {
                    tocHoverBox.style.opacity = '0';
                    const follower = document.querySelector('.cursor-follower');
                    if (follower) follower.style.opacity = '1';
                });

                li.appendChild(a);
                tocList.appendChild(li);
            });

            tocDropdown.appendChild(tocList);
            tocContainer.appendChild(tocDropdown);
            document.body.appendChild(tocContainer);

            // Toggle Logic
            tocToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                tocContainer.classList.toggle('active');
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!tocContainer.contains(e.target)) {
                    tocContainer.classList.remove('active');
                }
            });
        }
    }
});

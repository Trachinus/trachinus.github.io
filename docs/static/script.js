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

    // --- Fishing Hook ---
    const fishingLine = document.querySelector('.fishing-line');
    const fishHook = document.querySelector('.fish-hook');

    if (fishingLine && fishHook) {
        fishHook.addEventListener('click', () => {
            if (fishingLine.classList.contains('reeling')) return;

            fishingLine.classList.add('reeling');
            setTimeout(() => {
                fishingLine.classList.remove('reeling');
            }, 2050);
        });
    }

    // --- Copy Code Button & Expand Button ---
    document.querySelectorAll('pre').forEach(pre => {
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
            tocDropdown.innerHTML = '<div class="toc-title">Fishing spots</div>';

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

                a.addEventListener('mouseenter', (e) => {
                    const linkRect = a.getBoundingClientRect();
                    const containerRect = tocDropdown.getBoundingClientRect();

                    const relativeTop = linkRect.top - containerRect.top + tocDropdown.scrollTop;
                    const relativeLeft = linkRect.left - containerRect.left + tocDropdown.scrollLeft;

                    tocHoverBox.style.width = `${linkRect.width + 20}px`;
                    tocHoverBox.style.height = `${linkRect.height + 12}px`;
                    tocHoverBox.style.top = `${relativeTop - 6}px`;
                    tocHoverBox.style.left = `${relativeLeft - 10}px`;
                    tocHoverBox.style.opacity = '1';
                });

                a.addEventListener('mouseleave', () => {
                    tocHoverBox.style.opacity = '0';
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

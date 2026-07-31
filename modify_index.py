with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_marker = '<!-- Awards & Certifications Section -->'
end_marker = '<!-- Blog / Articles Section -->'

start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

print('Start Index:', start_idx)
print('End Index:', end_idx)

if start_idx != -1 and end_idx != -1:
    new_section = '''<!-- Awards & Certifications Section -->
        <section id="awards" class="py-16 bg-slate-50 dark:bg-slate-950/70 transition-colors duration-300">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Section Header -->
                <div class="text-center space-y-2 mb-12 fade-in-up">
                    <h2 class="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl" data-i18n="awards-title">Reviewer Impact & Professional Certifications</h2>
                    <div class="h-1 w-20 bg-primary-600 dark:bg-primary-400 mx-auto rounded" aria-hidden="true"></div>
                    <p class="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto text-lg" data-i18n="awards-desc">International peer-review credentials, academic certifications, and advanced specialized training.</p>
                </div>

                <!-- Part 1: Reviewer Certificates -->
                <div class="space-y-6 mb-16 fade-in-up">
                    <div class="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div class="bg-amber-100 dark:bg-amber-950/40 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
                            <i class="fa-solid fa-star text-xl" aria-hidden="true"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100" data-i18n="sub-reviewer-title">Peer Reviewer Impact</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400" data-i18n="sub-reviewer-desc">Verified review certificates for top international WoS/Scopus indexed scientific journals with Impact Factors.</p>
                        </div>
                    </div>
                    <!-- Reviewer Certs dynamic container -->
                    <div id="reviewer-certs-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Populated dynamically by JS -->
                    </div>
                </div>

                <!-- Part 2: Professional Certifications -->
                <div class="space-y-6 fade-in-up">
                    <div class="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div class="bg-primary-100 dark:bg-primary-950/40 p-2.5 rounded-xl text-primary-600 dark:text-primary-400">
                            <i class="fa-solid fa-graduation-cap text-xl" aria-hidden="true"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100" data-i18n="sub-cert-title">Specialized Credentials & Certifications</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400" data-i18n="sub-cert-desc">Official certifications in GIS, Remote Sensing, Data Manipulation in R, and Academic Research Writing.</p>
                        </div>
                    </div>
                    <!-- Professional Certs dynamic container -->
                    <div id="professional-certs-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Populated dynamically by JS -->
                    </div>
                </div>
            </div>
        </section>

        '''
    html = html[:start_idx] + new_section + html[end_idx:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Successfully modified index.html!')
else:
    print('Could not find markers!')
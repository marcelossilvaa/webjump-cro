(function() {
    const experienceName = "AT_EXPERIENCE_HOLIDAYS_ON_HOME_SEARCH";
    const experienceTargetUrl = 'https://www.voeazul.com.br/br/pt/home';
    const experienceAlreadyExecuted = window[experienceName] || false;

    const onExperienceTargetPage = () => {
        const currentFullUrl = window.location.origin + window.location.pathname;
        return currentFullUrl === experienceTargetUrl;
    };

    const initExperienceWhenReady = () => {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";
        const isDesktopDevice = window.innerWidth >= 992;

        if(!isDesktopDevice) {
            console.log("[AT] Not a desktop device, experience will not run.");
            return;
        }

        if (isReady) {
            experienceSetup();
        } else {
            document.addEventListener("DOMContentLoaded", experienceSetup);
        }
    }
    
    if(experienceAlreadyExecuted || !onExperienceTargetPage()) {
        console.log("[AT] Page is not a correct page OR script already executed.");
        return;
    }

    window[experienceName] = true;
    initExperienceWhenReady();

    function experienceSetup() {
        console.log("[AT] Experience started:", experienceName);

        const SELECTORS = {
            calendar: '.sc-brPLxw.kiuAPv',
            calendarWrapper: '.sc-leXBFf.VJGAB',
        };

        const HOLIDAYS = [
            {
                month: "Janeiro 2026",
                holidays: [
                    { name: "Confraternização mundial", day: 1 },
                ]
            },
            {
                month: "Abril 2026",
                holidays: [
                    { name: "Paixão de Cristo", day: 3 },
                    { name: "Tiradentes", day: 21 },
                ]
            },
            {
                month: "Maio 2026",
                holidays: [
                    { name: "Dia mundial do trabalho", day: 1 },

                ]
            },
            {
                month: "Junho 2026",
                holidays: [
                    { name: "Corpus Christi", day: 4 },

                ]
            },
            {
                month: "Setembro 2026",
                holidays: [
                    { name: "Independência do Brasil", day: 7 },

                ]
            },
            {
                month: "Outubro 2026",
                holidays: [
                    { name: "Nossa Senhora Aparecida", day: 12 },

                ]
            },
            {
                month: "Novembro 2026",
                holidays: [
                    { name: "Finados", day: 2 },
                    { name: "Proclamação da República", day: 15 },
                    { name: "Dia Nacional de Zumbi e da Consciência Negra", day: 20 },
                ]
            },
            {
                month: "Dezembro 2026",
                holidays: [
                    { name: "Natal", day: 25 },

                ]
            },
        ];

        // Observer to monitor changes in the body for calendar wrapper addition
        const bodyObserver = new MutationObserver(bodyObserverCallback);
        // Observer to monitor changes in calendar wrapper
        const calendarWrapperObserver = new MutationObserver(calendarWrapperObserverCallback);
        // To keep track of last months seen to avoid redundant processing
        const lastMonthsSeen = [];

        initSetup();
        
        function initSetup() {
            bodyObserver.observe(document.body, { childList: true, subtree: false });

            injectCSS();
        }
        
        function bodyObserverCallback(mutations) {
            let alreadyHasCalendar = false;

            for (const mutation of mutations) {
                if(mutation.addedNodes.length > 0 && mutation.type == "childList" && !alreadyHasCalendar) {
                    if(!onExperienceTargetPage()) {
                        bodyObserver.disconnect();
                        calendarWrapperObserver.disconnect();
                        console.log("[AT] User left the target page, observers disconnected.");
                        return;
                    }

                    const calendarWrapper = getCalendarWrapper();

                    if(!calendarWrapper) {
                        lastMonthsSeen.length = 0;
                        calendarWrapperObserver.disconnect();
                        return;
                    }

                    if(!alreadyHasCalendar) {
                        lastMonthsSeen.length = 0;
                    }


                    analyticsEvent("calendar_loaded");
                    alreadyHasCalendar = true;
                    injectCalendarHolidaysIfNeeded();
                    calendarWrapperObserver.observe(calendarWrapper, { childList: true, subtree: true });
                }
            }
        }
        

        function calendarWrapperObserverCallback(mutations) {
            for (const mutation of mutations) {
                if(mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                    injectCalendarHolidaysIfNeeded();
                }
            }
        }

        function injectCalendarHolidaysIfNeeded() {
            const calendarWrapper = getCalendarWrapper();
            const monthsProps = getMonthsProps(calendarWrapper);

            const isDateRangeMode = checkIfIsDateRangeMode(calendarWrapper);
                    
            //check if months doesnt have changed
            if((lastMonthsSeen[0] === monthsProps[0]?.name) && (lastMonthsSeen[1] === monthsProps[1]?.name) && (!isDateRangeMode)) {
                console.log("[AT] Months didnt change or in date range mode, skipping...");
                return;
            }

            reinitCalendarClassesAndHolidayElement();

            lastMonthsSeen.length = 0;
            lastMonthsSeen.push(monthsProps[0]?.name, monthsProps[1]?.name);

            monthsProps.forEach(calendarMonth => {
                const holidayMonth = HOLIDAYS.find(holiday => holiday.month === calendarMonth.name);
                if(!holidayMonth) return;

                holidayMonth.holidays.forEach(holiday => {
                    const holidayIsInCalendar = [...calendarMonth.days].find(day => day === String(holiday.day));

                    if(holidayIsInCalendar) {
                        calendarMonth.element.querySelectorAll("button").forEach(dayButton => {
                            const spans = dayButton.querySelectorAll("span");
                            const textToVerify = spans.length > 1 ? spans[1] : spans[0];

                            if(textToVerify.textContent.trim() === String(holiday.day)) {
                                dayButton.classList.add("inject-holiday-highlight");
                                dayButton.removeEventListener("click", addTrackingEvent);
                                dayButton.addEventListener("click", addTrackingEvent);
                            }
                        });
                    }

                    // Disconnect observer to avoid infinite loop
                    calendarWrapperObserver.disconnect();
                    const holidayElement = createHolidayElement(holiday);
                    calendarMonth.element.appendChild(holidayElement);
                            
                    calendarWrapperObserver.observe(calendarWrapper, { childList: true, subtree: true });
                });
            });
        }

        function checkIfIsDateRangeMode(calendarWrapper) {
            const buttons = calendarWrapper.querySelectorAll("button");

            for(const button of buttons) {
                const spans = button.querySelectorAll("span");
                if(spans.length > 1) {
                    return true;
                }
            }

            return false;
        }

        function createHolidayElement(holiday) {
            const holidayElement = document.createElement("div");
            holidayElement.classList.add("inject-holiday-element");
            holidayElement.textContent = holiday.name;

            const dayElement = document.createElement("span");
            dayElement.textContent = holiday.day;

            holidayElement.prepend(dayElement);

            return holidayElement;
        }

        function getMonthsProps(calendarWrapper) {
            if (!calendarWrapper) return [];

            const monthElements = [calendarWrapper.firstChild, calendarWrapper.lastChild];
            const monthsProps = Array.from(monthElements).map(monthElement => {
                return {
                    name: getMonthNameOfCalendar(monthElement),
                    days: getMonthDaysOfCalendar(monthElement),
                    element: monthElement
                };
            });

            return monthsProps;
        }

        function getMonthNameOfCalendar(monthElement) {
            if(!monthElement) return "";

            const monthNameElement = monthElement.firstChild?.querySelector("span").textContent || "";
            monthNameElementParsed = monthNameElement?.trim();

            return monthNameElementParsed || "";
        }

        function getMonthDaysOfCalendar(monthElement) {
            if(!monthElement) return [];

            const dayElements = monthElement.querySelectorAll("button") || [];
            const days = Array.from(dayElements).reduce((acc, el) => {
                const spans = el.querySelectorAll("span");
                const textToVerify = spans.length > 1 ? spans[1] : spans[0];

                const text = (textToVerify.textContent || '').trim();
                if (text) acc.push(text);
                return acc;
            }, []);

            return days;
        }

        function reinitCalendarClassesAndHolidayElement() {
            const holidayHighlightedDays = document.querySelectorAll(".inject-holiday-highlight");
            holidayHighlightedDays.forEach(day => day.classList.remove("inject-holiday-highlight"));

            const holidayElements = document.querySelectorAll(".inject-holiday-element");
            holidayElements.forEach(el => el.remove());
        }

        function addTrackingEvent(event) {
            analyticsEvent("user_clicked_holiday");
        }

        function injectCSS() {
            const styles = document.createElement("style");

            styles.innerHTML = `
                .inject-holiday-element {
                    background: #def2f9;
                    margin-top: 4px;
                    border-radius: 12px;
                    padding: 4px 8px;
                    display: flex;
                    gap: 8px;
                    color: #026cb6;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 500;
                }

                .inject-holiday-highlight:not(:hover)::after {
                    background: #def2f9;
                    content: '';
                    position: absolute;
                    height: 4px;
                    width: 4px;
                    background: #026cb6;
                    border-radius: 100%;
                    bottom: 4px;
                }

                .inject-holiday-element span {
                    font-weight: 700;
                    display: inline-block;
                    width: 17.8px;
                    color: #026cb6;
                    margin-left: 7.1px;
                    text-align: center;
                }

                .inject-holiday-highlight span {
                    font-weight: 700;
                    color: #026cb6;
                }

                .inject-holiday-highlight[disabled] span {
                    opacity: .6;
                }
            `;

            document.head.appendChild(styles);
        }

        function getCalendarWrapper() {
            return document.querySelector(SELECTORS.calendarWrapper);
        }
    }


    /**
     * Function to trigger an Adobe Analytics event.
     * Uses to track user interactions within the experience.
     * @param {string} eventLabel - Label of the event to be triggered.
     *
     * Example usage:
     * analyticsEvent("user_clicked_button");
     */
    function analyticsEvent(eventLabel) {
        if (eventLabel === undefined || !eventLabel) {
            console.log("[AT] Missing parameters for analytics event.");
            return;
        }

        const labelEvent = experienceName + " " + eventLabel;
        console.log("[AT] ANALYTICS_TRIGGERED:", labelEvent);

        // === Disparo Adobe Analytics ===
        (function () {
            var s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
            if (!s || typeof s.tl !== "function") return;

            s.linkTrackVars = "events,eVar82";
            s.linkTrackEvents = "event90";
            s.events = "event90";
            s.eVar82 = labelEvent;

            // dispara o link (o = custom link, d = download, e = exit)
            s.tl(true, "o", "target_activity_action");
        })();
    }
})();
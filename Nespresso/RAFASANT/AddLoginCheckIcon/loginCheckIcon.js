(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  const STYLE_ID = 'wj-login-check-icon-style';
  const CHECK_ATTRIBUTE = 'data-wj-login-check';
  const ACCOUNT_BUTTON_SELECTOR =
    '.cb-header-navigation__action-btn[aria-label="Acesse ou crie sua conta"]';

  function getStyles() {
    return [
      ACCOUNT_BUTTON_SELECTOR + ' {',
      '  position: relative !important;',
      '}',
      '[' + CHECK_ATTRIBUTE + '] {',
      '  position: absolute !important;',
      '  top: -4px !important;',
      '  right: -4px !important;',
      '  z-index: 9999 !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  width: 16px !important;',
      '  height: 16px !important;',
      '  border-radius: 50% !important;',
      '  background: #2e7d32 !important;',
      '  color: #ffffff !important;',
      '  font: bold 11px Arial, sans-serif !important;',
      '  pointer-events: none !important;',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function renderCheckIcon() {
    if (isProcessing) {
      return;
    }

    isProcessing = true;

    try {
      const accountButton = document.querySelector(ACCOUNT_BUTTON_SELECTOR);
      const userIsLoggedIn = !!document.getElementById('ta-login-dropdown--logged');
      const existingCheck = document.querySelector('[' + CHECK_ATTRIBUTE + ']');

      if (!userIsLoggedIn) {
        if (existingCheck) {
          existingCheck.remove();
        }
        return;
      }

      if (!accountButton) {
        return;
      }

      if (existingCheck && accountButton.contains(existingCheck)) {
        return;
      }

      const check = document.createElement('span');
      check.setAttribute(CHECK_ATTRIBUTE, '');
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';
      accountButton.appendChild(check);
    } finally {
      isProcessing = false;
    }
  }

  function observeHeader() {
    if (window.wjLoginCheckObserver) {
      return;
    }

    window.wjLoginCheckObserver = new MutationObserver(function () {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(renderCheckIcon, 150);
    });

    window.wjLoginCheckObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    injectStyles();
    renderCheckIcon();
    observeHeader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
/*
<div id="br-badge-login-status-container"></div>
<script>

new casperEventHub.Experience("user-status-badge-login-feature")
            .visitorIs({
                status: casperEventHub.oneOf('anonymous', 'not-logged-in')
            })
            .executeOnMatch(data => {

                var statusLoginIcon = `<style>
                #ta-login-dropdown--logged,
                     #ta-login-dropdown--not-logged {
                         position: relative;
                     }
                     #ta-login-dropdown--not-logged:after {
                         position: absolute;
                         left: 22px;
                         top: 2px;
                         width: 14px;
                         height: 14px;
                         content: '';
                         background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDA2IDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI3QjhGOEYyNjEwQzExRUNBNjg1RDBBMTM5RkJFQTVDIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI3QjhGOEYxNjEwQzExRUNBNjg1RDBBMTM5RkJFQTVDIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMi40IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjI4N0M3OUUzMTA3MjExRUNBQ0I2OUU3RTExRkNGM0NBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjI4N0M3OUU0MTA3MjExRUNBQ0I2OUU3RTExRkNGM0NBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+biX5AAAAA8tJREFUeNp8VWtsVEUU/mbm3rvb7rJUKNRoiMQoIMb6j8QfaiU+YuqDNqXEtkgJPhK6EYIGY9T+MfGf+qM0RoNCkLZiVAINJhBjfACJGqPWH21tNMWqhbp93+7zzoxn5naXSmtPMruTOed8c875zpzLCg6HkZGb1+BUbTU4AiilHC7cZq11La1qUlchlCu0+rTGGc5ZF4cKJATu/6ofm/pGrQFHUbQCYwwarBlMDEmpjhLYdtJspFUxv8x+O9kZ3ZDSaGZ0EPODEgwnFJgVzyoorTs0+HE6WG+O/1+0+VlvbBV4B1eypGHfP3InGBf49tbEoUwg2gQzxqzotOyeoqSQHLjS76y5MJJknOLrOFADqVAn4X7KIcEJPChkUcj61skrT0AI10LIII98Zsbu3egKOG6E6i2hmQNPqHoGdZJr5nINcYRpSZlz5DI+gnwGt9XswS13NSIzPRZekEsjl57ChrufxMZ7Wi1wgeyMj/HNF9QRWtyRMmjSmq00NZNBzhJz+wN78XB9q43kY4pq4MujxBPH5q3PYlvLvrD4lMng+Q+g6N+UjPwIQzQ5lNYOxsLaKCnheNESmJGGp15Bd2YWTqQcdbueL53XNjyNoYs9NmVBgKaehNPI3tq/dZj0NxULnae04qvX4Zn2HohIZEmOLw32o/f9F5CZScErSywgCpdMH1YubIdofBUm/x7E2+0N+PyzTxaBnTvdg1Pv7oM/PoJorGIhmJFKvlQEBnTir36kp0YX6fzxPzB5+TdEYquWjN7UMEW3xGzCxJhhM+tPoPqhJB5rSi5yqN/9onma+PX8MZQl1kI4EaqfKqpTnPj4Rc9HbfrMFPmOB9uwbef+Esh333yBgZ9+uErUnpew6d7dkIUc2QcLrmN9HFqeYPPvTAYFuJEYHn1ib8lkmAj4+sOXcfbYQeR8/2qkrQdBA4Q6IwQMg9IfUVeKbgKctt0fKbMsH35tlzWaTaXQe/gAgtwc1fMK3nt9ZwnwnfYdtm+F49nuoFc3TZOqm73x3H2meHWMO/bpGcnMpnDdjZsppSxmxn5H+coqG0J6ZgwV12+ww2RqdBDlVMPi03O4rqdxdlK86mnccHlq4J+q6BrJvS3G0Y3GMTfxJz2vWZStWB06UUqeOSfmc3OTdF5pyaFnAq4LndDBm4YcVhywE2sTON645RBF2XZNby0jNHGY6Hy898fkuuHx/w5YP+ZRJtr0SYvhIhxVy4KRjW6hqJI0va01C/swlHS8tO2ie0+QtplMrv0EjNH6mUg8Q+ddVIbAoPhxt3TNvwIMAA1SpTtOA3IiAAAAAElFTkSuQmCC');
                         background-size: cover;
                         background-repeat: no-repeat;
                         background-position: center center;
                     }
                 
                     #ta-login-dropdown--logged:after {
                         position: absolute;
                         left: 22px;
                         top: 2px;
                         width: 14px;
                         height: 14px;
                         content: '';
                         background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAADqADAAQAAAABAAAADgAAAAC98Dn6AAABs0lEQVQoFZ1SSyiEURT+zv2HJMNMlDHKeG5EeZTYeDVDNA1ZyEZiIQs7k9eapCxtKPakFNkIC0UpOxFSDOWdxzAeY2aue/+ZH1PDwqnTfx7f9597HoQf4hhN0t9zt5MABzjPVlNERxxYMFL82ELf7ZMGF5iglI/EVHMEpgFu0WLhX3IRWMf6wNuajKtElUT+FfCgH0744RE4ccUqyaQ+L+De+b0SoGNRSNKbcfnokrVcRhafz2RPf5Fio/WYaNvATNchUhLSBZFbJIcJq0FoRJGVhpvmkJNcgLO7Q9x5rlScHB4jzrOkV2SpxHz3KRoKO79+MmifQnF6FW6fL+CctePd9xrMiYnrNBQjBYlxJvTUjoMRg9mQCWtuCzzvbvTOOkL9aWhAsdh0zcI1nT8c4+HlBmVZdarmpZbiw+9F/1wjds+3vhnCIqI9Jc2qmIVdITP7F9u491yjLLte7J9jaLEdm0dLMhUuRJMR11GSYUOAB7B9shpOUL3gOv59AHIdUC9BXIRcboQSoZA4udDVyICiAV2rvuOCGuPUG7wfonuDeEqcUK8chPAnxbW0Lve7DzT8JwO8pngGmx03AAAAAElFTkSuQmCC');
                         background-size: cover;
                         background-repeat: no-repeat;
                         background-position: center center;
                     }
                 
                     .expChecks li:before {
                         content: '';
                         width: 16px;
                         height: 16px;
                         background-color: lime;
                         display: inline-block;
                         margin-right: 10px;
                         background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDA2IDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMi40IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0OUFFMzQ0OTEwN0ExMUVDOEY1NUFBODgzMDc4NERFRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0OUFFMzQ0QTEwN0ExMUVDOEY1NUFBODgzMDc4NERFRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5QUUzNDQ3MTA3QTExRUM4RjU1QUE4ODMwNzg0REVEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQ5QUUzNDQ4MTA3QTExRUM4RjU1QUE4ODMwNzg0REVEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+LOevlgAAARtJREFUeNpi/P//PwM1ARMDlQFLdL8upWawAnEbEC8C4sssVHDURiD2BOJwINal1MDtQOwBZcsC8U0mKhkGAz/JNXAnFsNuArEmzEB+IE4m0rBdQOyGJnYDiPWA+BvIQD4gvgjEc4D4EAHDdgOxK5rYdahhv2Dp8BYQy0MlbYH4CA7D9gCxCw6X/UZO2N/QFFkD8X40sW1A7IwmdheI9YH4D3pO0QTia2iKHYB4KxALAvFqaDpDBreRvYmSU0BRDZUEhaM2kpwXEL8AYjYchv3Al5f/QhVdQZPHZpgOLsPQC4d/QGwAxJdwqAWlM11s3sRX2oBcagj1PrbY/ElO8YXu0pvQ2PxFaXkIitkJ0Mj5RWyeZBz0JTZAgAEAPwg/veT6jZgAAAAASUVORK5CYII=');
                         background-size: cover;
                         background-repeat: no-repeat;
                         background-position: center center;
                         vertical-align: middle;
                         margin-bottom: 4px;
                     }
                 
                     @media only screen and (max-width: 768px) {
                 
                         #ta-login-dropdown--not-logged:after,
                         #ta-login-dropdown--logged:after {
                            left: 30px;
                            top: 4px;
                            width: 16px;
                            height: 16px;
                         }
                 
                         #ta-login-dropdown--not-logged.LoginDropdownButton--open:after,
                         #ta-login-dropdown--logged.LoginDropdownButton--open:after {
                             display: none;
                         }
                        Code for left alignment menu
                        ul.AccountMenu__section-list {
                            text-align: left!important;
                        }
                        .LoggedInPanel__title {
                            font-size: 1rem!important;
                            text-align: left!important;
                        }
                     }
                </style>`
                document.getElementById("br-badge-login-status-container").innerHTML = statusLoginIcon;

                gtmDataObject = window.gtmDataObject || [];
                gtmDataObject.push({
                    event: 'impression', //This is required here
                    ecommerce: {
                        promoView: { //This is required and critical
                            promotions: [ // Array of banners 
                                {
                                    creative: 'Casper_StatusLoginIcon_GeneralImpressions', //Creative name
                                    id: 'Casper_StatusLoginIcon_GeneralImpressions', // Global Campaign ID
                                    name: 'Casper_StatusLoginIcon_GeneralImpressions', // Banner name
                                    position: 'Casper_StatusLoginIcon_GeneralImpressions' // Banner position on the page
                                }
                            ]
                        }
                    }
                })

               // data.unsubscribe();
            })
            .executeOnMismatch(data => {

                var statusLoginIcon = `<style>
                #ta-login-dropdown--logged,
                     #ta-login-dropdown--not-logged {
                         position: relative;
                     }
                     #ta-login-dropdown--not-logged:after {
                         position: absolute;
                         left: 22px;
                         top: 2px;
                         width: 14px;
                         height: 14px;
                         content: '';
                         background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDA2IDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI3QjhGOEYyNjEwQzExRUNBNjg1RDBBMTM5RkJFQTVDIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI3QjhGOEYxNjEwQzExRUNBNjg1RDBBMTM5RkJFQTVDIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMi40IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjI4N0M3OUUzMTA3MjExRUNBQ0I2OUU3RTExRkNGM0NBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjI4N0M3OUU0MTA3MjExRUNBQ0I2OUU3RTExRkNGM0NBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+biX5AAAAA8tJREFUeNp8VWtsVEUU/mbm3rvb7rJUKNRoiMQoIMb6j8QfaiU+YuqDNqXEtkgJPhK6EYIGY9T+MfGf+qM0RoNCkLZiVAINJhBjfACJGqPWH21tNMWqhbp93+7zzoxn5naXSmtPMruTOed8c875zpzLCg6HkZGb1+BUbTU4AiilHC7cZq11La1qUlchlCu0+rTGGc5ZF4cKJATu/6ofm/pGrQFHUbQCYwwarBlMDEmpjhLYdtJspFUxv8x+O9kZ3ZDSaGZ0EPODEgwnFJgVzyoorTs0+HE6WG+O/1+0+VlvbBV4B1eypGHfP3InGBf49tbEoUwg2gQzxqzotOyeoqSQHLjS76y5MJJknOLrOFADqVAn4X7KIcEJPChkUcj61skrT0AI10LIII98Zsbu3egKOG6E6i2hmQNPqHoGdZJr5nINcYRpSZlz5DI+gnwGt9XswS13NSIzPRZekEsjl57ChrufxMZ7Wi1wgeyMj/HNF9QRWtyRMmjSmq00NZNBzhJz+wN78XB9q43kY4pq4MujxBPH5q3PYlvLvrD4lMng+Q+g6N+UjPwIQzQ5lNYOxsLaKCnheNESmJGGp15Bd2YWTqQcdbueL53XNjyNoYs9NmVBgKaehNPI3tq/dZj0NxULnae04qvX4Zn2HohIZEmOLw32o/f9F5CZScErSywgCpdMH1YubIdofBUm/x7E2+0N+PyzTxaBnTvdg1Pv7oM/PoJorGIhmJFKvlQEBnTir36kp0YX6fzxPzB5+TdEYquWjN7UMEW3xGzCxJhhM+tPoPqhJB5rSi5yqN/9onma+PX8MZQl1kI4EaqfKqpTnPj4Rc9HbfrMFPmOB9uwbef+Esh333yBgZ9+uErUnpew6d7dkIUc2QcLrmN9HFqeYPPvTAYFuJEYHn1ib8lkmAj4+sOXcfbYQeR8/2qkrQdBA4Q6IwQMg9IfUVeKbgKctt0fKbMsH35tlzWaTaXQe/gAgtwc1fMK3nt9ZwnwnfYdtm+F49nuoFc3TZOqm73x3H2meHWMO/bpGcnMpnDdjZsppSxmxn5H+coqG0J6ZgwV12+ww2RqdBDlVMPi03O4rqdxdlK86mnccHlq4J+q6BrJvS3G0Y3GMTfxJz2vWZStWB06UUqeOSfmc3OTdF5pyaFnAq4LndDBm4YcVhywE2sTON645RBF2XZNby0jNHGY6Hy898fkuuHx/w5YP+ZRJtr0SYvhIhxVy4KRjW6hqJI0va01C/swlHS8tO2ie0+QtplMrv0EjNH6mUg8Q+ddVIbAoPhxt3TNvwIMAA1SpTtOA3IiAAAAAElFTkSuQmCC');
                         background-size: cover;
                         background-repeat: no-repeat;
                         background-position: center center;
                     }
                 
                     #ta-login-dropdown--logged:after {
                         position: absolute;
                         left: 22px;
                         top: 2px;
                         width: 14px;
                         height: 14px;
                         content: '';
                         background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAADqADAAQAAAABAAAADgAAAAC98Dn6AAABs0lEQVQoFZ1SSyiEURT+zv2HJMNMlDHKeG5EeZTYeDVDNA1ZyEZiIQs7k9eapCxtKPakFNkIC0UpOxFSDOWdxzAeY2aue/+ZH1PDwqnTfx7f9597HoQf4hhN0t9zt5MABzjPVlNERxxYMFL82ELf7ZMGF5iglI/EVHMEpgFu0WLhX3IRWMf6wNuajKtElUT+FfCgH0744RE4ccUqyaQ+L+De+b0SoGNRSNKbcfnokrVcRhafz2RPf5Fio/WYaNvATNchUhLSBZFbJIcJq0FoRJGVhpvmkJNcgLO7Q9x5rlScHB4jzrOkV2SpxHz3KRoKO79+MmifQnF6FW6fL+CctePd9xrMiYnrNBQjBYlxJvTUjoMRg9mQCWtuCzzvbvTOOkL9aWhAsdh0zcI1nT8c4+HlBmVZdarmpZbiw+9F/1wjds+3vhnCIqI9Jc2qmIVdITP7F9u491yjLLte7J9jaLEdm0dLMhUuRJMR11GSYUOAB7B9shpOUL3gOv59AHIdUC9BXIRcboQSoZA4udDVyICiAV2rvuOCGuPUG7wfonuDeEqcUK8chPAnxbW0Lve7DzT8JwO8pngGmx03AAAAAElFTkSuQmCC');
                         background-size: cover;
                         background-repeat: no-repeat;
                         background-position: center center;
                     }
                 
                     .expChecks li:before {
                         content: '';
                         width: 16px;
                         height: 16px;
                         background-color: lime;
                         display: inline-block;
                         margin-right: 10px;
                         background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDA2IDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMi40IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0OUFFMzQ0OTEwN0ExMUVDOEY1NUFBODgzMDc4NERFRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0OUFFMzQ0QTEwN0ExMUVDOEY1NUFBODgzMDc4NERFRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5QUUzNDQ3MTA3QTExRUM4RjU1QUE4ODMwNzg0REVEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQ5QUUzNDQ4MTA3QTExRUM4RjU1QUE4ODMwNzg0REVEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+LOevlgAAARtJREFUeNpi/P//PwM1ARMDlQFLdL8upWawAnEbEC8C4sssVHDURiD2BOJwINal1MDtQOwBZcsC8U0mKhkGAz/JNXAnFsNuArEmzEB+IE4m0rBdQOyGJnYDiPWA+BvIQD4gvgjEc4D4EAHDdgOxK5rYdahhv2Dp8BYQy0MlbYH4CA7D9gCxCw6X/UZO2N/QFFkD8X40sW1A7IwmdheI9YH4D3pO0QTia2iKHYB4KxALAvFqaDpDBreRvYmSU0BRDZUEhaM2kpwXEL8AYjYchv3Al5f/QhVdQZPHZpgOLsPQC4d/QGwAxJdwqAWlM11s3sRX2oBcagj1PrbY/ElO8YXu0pvQ2PxFaXkIitkJ0Mj5RWyeZBz0JTZAgAEAPwg/veT6jZgAAAAASUVORK5CYII=');
                         background-size: cover;
                         background-repeat: no-repeat;
                         background-position: center center;
                         vertical-align: middle;
                         margin-bottom: 4px;
                     }
                 
                     @media only screen and (max-width: 768px) {
                 
                         #ta-login-dropdown--not-logged:after,
                         #ta-login-dropdown--logged:after {
                            left: 30px;
                            top: 4px;
                            width: 16px;
                            height: 16px;
                         }
                 
                         #ta-login-dropdown--not-logged.LoginDropdownButton--open:after,
                         #ta-login-dropdown--logged.LoginDropdownButton--open:after {
                             display: none;
                         }
                        Code for left alignment menu
                        ul.AccountMenu__section-list {
                            text-align: left!important;
                        }
                        .LoggedInPanel__title {
                            font-size: 1rem!important;
                            text-align: left!important;
                        }
                     }
                </style>`
                document.getElementById("br-badge-login-status-container").innerHTML = statusLoginIcon;

                gtmDataObject = window.gtmDataObject || [];
                gtmDataObject.push({
                    event: 'impression', //This is required here
                    ecommerce: {
                        promoView: { //This is required and critical
                            promotions: [ // Array of banners 
                                {
                                    creative: 'Casper_StatusLoginIcon_GeneralImpressions', //Creative name
                                    id: 'Casper_StatusLoginIcon_GeneralImpressions', // Global Campaign ID
                                    name: 'Casper_StatusLoginIcon_GeneralImpressions', // Banner name
                                    position: 'Casper_StatusLoginIcon_GeneralImpressions' // Banner position on the page
                                }
                            ]
                        }
                    }
                })

               // data.unsubscribe();
            })
            .evaluate();

        </script>
*/
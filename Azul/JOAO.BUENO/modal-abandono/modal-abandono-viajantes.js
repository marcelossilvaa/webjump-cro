// Modal de abandono - Etapa Viajantes
(function () {
    'use strict';

    var MAXIMUM_MINUTES_OF_INACTIVITY = 5;
    var MINUTES_TO_MILLISECONDS = 60 * 1000;
    var MAXIMUM_INACTIVITY_TIME = MAXIMUM_MINUTES_OF_INACTIVITY * MINUTES_TO_MILLISECONDS;
    var INACTIVITY_TIMEOUT;

    var EXPECTED_STEP = 'Viajantes';

    var SELECTORS = {
        header: 'header.main-header',
        buttonGoHome: 'header a.azul-logo',
        activeBreadcrumb: '#hotel-recommendation .css-r1ir45',
    };

    var BUTTON_GO_HOME_FLAG = 'isAbandonmentModalTriggered';

    var eventForGiveupModalWhenTriggeredByRedirect = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });

    eventForGiveupModalWhenTriggeredByRedirect.isAbandonmentModalTriggered = true;

    var iconTravel = '<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H200V200H0V0Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M90.1623 34.3638C91.9475 31.1792 95.307 29 99.2082 29C104.961 29 109.625 33.68 109.625 39.452C109.625 39.5362 109.613 39.6174 109.602 39.6989C109.592 39.7705 109.581 39.8423 109.579 39.9164C112.631 40.983 114.833 43.8665 114.833 47.291C114.833 51.6187 111.334 55.1299 107.021 55.1299H80.979C76.6659 55.1299 73.1665 51.6187 73.1665 47.291C73.1665 42.9632 76.6659 39.452 80.979 39.452C81.0729 39.452 81.1633 39.4643 81.2533 39.4765C81.3169 39.4851 81.3802 39.4937 81.4444 39.4979C82.5074 36.4358 85.3786 34.226 88.7915 34.226C89.262 34.226 89.7172 34.2847 90.1623 34.3638ZM106.813 39.1876C106.762 34.9253 103.286 31.4717 99.0189 31.4717C96.2384 31.4717 93.6507 33.0129 92.2604 35.4898L91.3548 37.1047L89.5358 36.7767C89.1603 36.7105 88.8812 36.68 88.6275 36.68C86.4407 36.68 84.4821 38.0889 83.7515 40.1895L83.102 42.0588L81.1282 41.929C81.0014 41.9214 80.8745 41.9062 80.7527 41.8883C77.9266 41.9341 75.6382 44.2534 75.6382 47.0967C75.6382 49.9704 77.9697 52.305 80.8339 52.305H106.813C109.679 52.305 112.008 49.9704 112.008 47.0967C112.008 44.9045 110.603 42.9386 108.512 42.2088L106.706 41.5781L106.772 39.6657C106.777 39.5029 106.792 39.3453 106.813 39.1876Z" fill="#F0F0F0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M166.996 94.5308C168.781 91.3462 172.14 89.167 176.042 89.167C181.794 89.167 186.458 93.8469 186.458 99.619C186.458 99.7031 186.447 99.7844 186.435 99.8659C186.425 99.9375 186.415 100.009 186.413 100.083C189.464 101.15 191.667 104.033 191.667 107.458C191.667 111.786 188.167 115.297 183.854 115.297H157.812C153.499 115.297 150 111.786 150 107.458C150 103.13 153.499 99.619 157.812 99.619C157.906 99.619 157.997 99.6313 158.087 99.6435C158.15 99.6521 158.214 99.6607 158.278 99.6649C159.341 96.6028 162.212 94.393 165.625 94.393C166.095 94.393 166.551 94.4517 166.996 94.5308ZM183.646 99.3546C183.595 95.0923 180.12 91.6387 175.852 91.6387C173.072 91.6387 170.484 93.1799 169.094 95.6568L168.188 97.2717L166.369 96.9437C165.994 96.8775 165.715 96.847 165.461 96.847C163.274 96.847 161.316 98.2559 160.585 100.357L159.935 102.226L157.962 102.096C157.835 102.088 157.708 102.073 157.586 102.055C154.76 102.101 152.472 104.42 152.472 107.264C152.472 110.137 154.803 112.472 157.667 112.472H183.646C186.513 112.472 188.842 110.137 188.842 107.264C188.842 105.071 187.436 103.106 185.346 102.376L183.54 101.745L183.605 99.8327C183.61 99.6699 183.626 99.5123 183.646 99.3546Z" fill="#F0F0F0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M26.1623 158.697C27.9475 155.512 31.307 153.333 35.2082 153.333C40.9608 153.333 45.6248 158.013 45.6248 163.785C45.6248 163.869 45.6133 163.95 45.6018 164.032C45.5916 164.104 45.5815 164.175 45.5791 164.249C48.6309 165.316 50.8332 168.199 50.8332 171.624C50.8332 175.952 47.3338 179.463 43.0207 179.463H16.979C12.6659 179.463 9.1665 175.952 9.1665 171.624C9.1665 167.296 12.6659 163.785 16.979 163.785C17.0729 163.785 17.1633 163.797 17.2533 163.809C17.3169 163.818 17.3802 163.827 17.4444 163.831C18.5074 160.769 21.3786 158.559 24.7915 158.559C25.262 158.559 25.7172 158.618 26.1623 158.697ZM42.8125 163.521C42.7618 159.258 39.2861 155.805 35.0189 155.805C32.2384 155.805 29.6507 157.346 28.2604 159.823L27.3548 161.438L25.5358 161.11C25.1603 161.044 24.8812 161.013 24.6275 161.013C22.4407 161.013 20.4821 162.422 19.7515 164.523L19.102 166.392L17.1282 166.262C17.0014 166.254 16.8745 166.239 16.7527 166.221C13.9266 166.267 11.6382 168.586 11.6382 171.43C11.6382 174.303 13.9697 176.638 16.8339 176.638H42.8125C45.6793 176.638 48.0082 174.303 48.0082 171.43C48.0082 169.237 46.6028 167.272 44.5123 166.542L42.706 165.911L42.7719 163.999C42.777 163.836 42.7922 163.678 42.8125 163.521Z" fill="#F0F0F0"/><g filter="url(#filter0_d_1224_19063)"><path d="M56 62.6665C56 58.2482 59.5817 54.6665 64 54.6665H121.333C125.752 54.6665 129.333 58.2482 129.333 62.6665V120C129.333 124.418 125.752 128 121.333 128H64C59.5817 128 56 124.418 56 120V62.6665Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M121.333 56.3332H64C60.5022 56.3332 57.6667 59.1687 57.6667 62.6665V120C57.6667 123.498 60.5022 126.333 64 126.333H121.333C124.831 126.333 127.667 123.498 127.667 120V62.6665C127.667 59.1687 124.831 56.3332 121.333 56.3332ZM64 54.6665C59.5817 54.6665 56 58.2482 56 62.6665V120C56 124.418 59.5817 128 64 128H121.333C125.752 128 129.333 124.418 129.333 120V62.6665C129.333 58.2482 125.752 54.6665 121.333 54.6665H64Z" fill="#026CB6"/><path d="M66 85C66 83.8954 66.8954 83 68 83H80.6667C81.7712 83 82.6667 83.8954 82.6667 85V97.6667C82.6667 98.7712 81.7712 99.6667 80.6667 99.6667H68C66.8954 99.6667 66 98.7712 66 97.6667V85Z" fill="#B2DEF0"/><path d="M56 114.667H129.333V120C129.333 124.418 125.752 128 121.333 128H64C59.5817 128 56 124.418 56 120V114.667Z" fill="#E8F6FB"/><path fill-rule="evenodd" clip-rule="evenodd" d="M127.663 116.337H57.67V120C57.67 123.496 60.504 126.33 64 126.33H121.333C124.829 126.33 127.663 123.496 127.663 120V116.337ZM56 114.667V120C56 124.418 59.5817 128 64 128H121.333C125.752 128 129.333 124.418 129.333 120V114.667H56Z" fill="#026CB6"/><path d="M56 62.6665C56 58.2482 59.5817 54.6665 64 54.6665H121.333C125.752 54.6665 129.333 58.2482 129.333 62.6665V74.6665H56V62.6665Z" fill="#B2DEF0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M121.333 56.3365H64C60.504 56.3365 57.67 59.1705 57.67 62.6665V72.9965H127.663V62.6665C127.663 59.1705 124.829 56.3365 121.333 56.3365ZM64 54.6665C59.5817 54.6665 56 58.2482 56 62.6665V74.6665H129.333V62.6665C129.333 58.2482 125.752 54.6665 121.333 54.6665H64Z" fill="#026CB6"/><path d="M66 52.1667C66 49.8655 67.8655 48 70.1667 48C72.4679 48 74.3333 49.8655 74.3333 52.1667V57.1667C74.3333 59.4679 72.4679 61.3333 70.1667 61.3333C67.8655 61.3333 66 59.4679 66 57.1667V52.1667Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M72.6633 57.1667V52.1667C72.6633 50.7878 71.5455 49.67 70.1667 49.67C68.7878 49.67 67.67 50.7878 67.67 52.1667V57.1667C67.67 58.5455 68.7878 59.6633 70.1667 59.6633C71.5455 59.6633 72.6633 58.5455 72.6633 57.1667ZM70.1667 48C67.8655 48 66 49.8655 66 52.1667V57.1667C66 59.4679 67.8655 61.3333 70.1667 61.3333C72.4679 61.3333 74.3333 59.4679 74.3333 57.1667V52.1667C74.3333 49.8655 72.4679 48 70.1667 48Z" fill="#026CB6"/><path d="M111 52.1667C111 49.8655 112.865 48 115.167 48C117.468 48 119.333 49.8655 119.333 52.1667V57.1667C119.333 59.4679 117.468 61.3333 115.167 61.3333C112.865 61.3333 111 59.4679 111 57.1667V52.1667Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M117.663 57.1667V52.1667C117.663 50.7878 116.546 49.67 115.167 49.67C113.788 49.67 112.67 50.7878 112.67 52.1667V57.1667C112.67 58.5455 113.788 59.6633 115.167 59.6633C116.546 59.6633 117.663 58.5455 117.663 57.1667ZM115.167 48C112.865 48 111 49.8655 111 52.1667V57.1667C111 59.4679 112.865 61.3333 115.167 61.3333C117.468 61.3333 119.333 59.4679 119.333 57.1667V52.1667C119.333 49.8655 117.468 48 115.167 48Z" fill="#026CB6"/></g><path fill-rule="evenodd" clip-rule="evenodd" d="M44.0948 44.7782C44.6906 44.1539 45.6796 44.1308 46.3039 44.7266L51.685 49.862C52.3093 50.4578 52.3324 51.4469 51.7366 52.0712C51.1408 52.6954 50.1518 52.7185 49.5275 52.1228L44.1464 46.9873C43.5221 46.3915 43.499 45.4025 44.0948 44.7782Z" fill="#008055"/><path fill-rule="evenodd" clip-rule="evenodd" d="M57.2589 42.5705C58.1187 42.6442 58.756 43.4009 58.6823 44.2607L58.2754 49.0066C58.2017 49.8663 57.445 50.5036 56.5852 50.4299C55.7254 50.3562 55.0881 49.5994 55.1618 48.7396L55.5687 43.9938C55.6424 43.134 56.3991 42.4968 57.2589 42.5705Z" fill="#008055"/><path fill-rule="evenodd" clip-rule="evenodd" d="M50.0892 56.9064C50.2986 57.7436 49.7897 58.592 48.9526 58.8014L44.3317 59.9572C43.4945 60.1666 42.6461 59.6576 42.4367 58.8205C42.2273 57.9833 42.7362 57.1349 43.5734 56.9256L48.1943 55.7698C49.0314 55.5604 49.8798 56.0693 50.0892 56.9064Z" fill="#008055"/><g filter="url(#filter1_d_1224_19063)"><path d="M134.563 125.999L122.073 138.557L123.241 145.731C123.279 145.969 123.202 146.21 123.033 146.381L121.803 147.617C121.456 147.966 120.874 147.887 120.631 147.458L115.971 139.24L107.796 134.554C107.37 134.31 107.292 133.725 107.639 133.376L108.868 132.14C109.037 131.969 109.278 131.892 109.514 131.93L116.65 133.104L129.141 120.547L107.301 108.71C106.863 108.472 106.776 107.877 107.128 107.523L109.312 105.327C109.497 105.141 109.766 105.066 110.019 105.13L137.566 112.076L149.367 100.212C150.818 98.7527 153.208 98.8047 154.698 100.303C156.19 101.803 156.241 104.204 154.789 105.664L142.988 117.528L149.897 145.223C149.961 145.478 149.887 145.748 149.702 145.934L147.517 148.13C147.165 148.484 146.573 148.397 146.337 147.956L134.563 125.999Z" fill="#026CB6"/><path fill-rule="evenodd" clip-rule="evenodd" d="M107.586 107.984C107.541 108.029 107.552 108.106 107.609 108.137L130.215 120.389L116.874 133.802L109.41 132.574C109.379 132.569 109.348 132.579 109.327 132.601L108.097 133.837C108.053 133.882 108.063 133.957 108.117 133.988L116.446 138.762L121.194 147.136C121.225 147.191 121.3 147.201 121.345 147.156L122.574 145.92C122.596 145.898 122.606 145.867 122.601 145.836L121.38 138.332L134.721 124.919L146.907 147.647C146.938 147.704 147.014 147.715 147.059 147.67L149.243 145.473C149.267 145.449 149.277 145.415 149.269 145.382L142.27 117.329L154.331 105.203C155.514 104.014 155.495 102.026 154.24 100.764C152.987 99.5041 151.007 99.4842 149.825 100.673L137.764 112.799L109.862 105.762C109.829 105.754 109.795 105.764 109.771 105.788L107.586 107.984ZM106.993 109.284C106.173 108.839 106.01 107.725 106.67 107.062L108.854 104.866C109.2 104.518 109.702 104.378 110.177 104.498L137.367 111.354L148.908 99.751C150.628 98.0217 153.429 98.1057 155.157 99.8426C156.886 101.581 156.968 104.395 155.248 106.125L143.707 117.728L150.526 145.065C150.645 145.542 150.506 146.047 150.16 146.395L147.976 148.591C147.317 149.254 146.208 149.091 145.766 148.266L134.406 127.079L122.767 138.781L123.881 145.626C123.953 146.071 123.808 146.523 123.491 146.842L122.262 148.078C121.612 148.731 120.523 148.583 120.068 147.781L115.495 139.718L107.475 135.121C106.677 134.663 106.531 133.568 107.18 132.915L108.41 131.679C108.727 131.36 109.177 131.215 109.619 131.287L116.427 132.408L128.066 120.705L106.993 109.284Z" fill="#026CB6"/><path fill-rule="evenodd" clip-rule="evenodd" d="M146.991 147.602L149.175 145.405L142.164 117.3L154.263 105.135C155.419 103.973 155.378 102.045 154.172 100.832C152.968 99.6217 151.048 99.5785 149.892 100.741L137.793 112.905L109.838 105.856L107.654 108.052L130.373 120.365L116.906 133.905L109.394 132.669L108.164 133.905L116.516 138.692L121.277 147.088L122.506 145.852L121.277 138.299L134.744 124.76L146.991 147.602Z" fill="white"/><mask id="mask0_1224_19063" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="107" y="99" width="49" height="49"><path fill-rule="evenodd" clip-rule="evenodd" d="M146.991 147.602L149.175 145.405L142.164 117.3L154.263 105.135C155.419 103.973 155.378 102.045 154.172 100.832C152.968 99.6217 151.048 99.5785 149.892 100.741L137.793 112.905L109.838 105.856L107.654 108.052L130.373 120.365L116.906 133.905L109.394 132.669L108.164 133.905L116.516 138.692L121.277 147.088L122.506 145.852L121.277 138.299L134.744 124.76L146.991 147.602Z" fill="white"/></mask><g mask="url(#mask0_1224_19063)"><path fill-rule="evenodd" clip-rule="evenodd" d="M117.884 137.43L154.863 100.252L155.508 103.883L121.279 138.297L117.884 137.43Z" fill="#B2DEF0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M140.026 111.467L140.552 110.938L141.143 111.531L140.617 112.06L140.026 111.467ZM138.449 113.053L138.975 112.525L139.565 113.118L139.039 113.647L138.449 113.053ZM142.132 109.352L141.606 109.88L142.196 110.474L142.722 109.945L142.132 109.352ZM143.183 108.294L143.709 107.765L144.299 108.358L143.773 108.887L143.183 108.294ZM145.287 106.178L144.761 106.707L145.351 107.3L145.877 106.772L145.287 106.178Z" fill="#026CB6"/><path fill-rule="evenodd" clip-rule="evenodd" d="M141.605 116.226L142.131 115.697L142.721 116.29L142.195 116.819L141.605 116.226ZM143.183 114.64L143.709 114.111L144.299 114.704L143.773 115.233L143.183 114.64ZM145.287 112.525L144.761 113.053L145.351 113.647L145.877 113.118L145.287 112.525ZM146.339 111.467L146.866 110.938L147.456 111.531L146.93 112.06L146.339 111.467ZM148.444 109.351L147.918 109.88L148.508 110.474L149.034 109.945L148.444 109.351Z" fill="#026CB6"/><path fill-rule="evenodd" clip-rule="evenodd" d="M116.074 138.012L116.456 137.072L121.383 138.325L122.571 145.874L121.218 147.188L116.074 138.012Z" fill="#B2DEF0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M117.122 139.118L118.216 138.591L116.875 133.789L109.326 132.607L108.021 133.918L117.122 139.118Z" fill="#B2DEF0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M150.714 101.604L150.185 102.136C150.185 102.136 151.578 102.381 152.176 102.779L153.089 101.86C152.442 101.344 150.714 101.604 150.714 101.604ZM153.344 104.249L152.815 104.78C152.815 104.78 152.572 103.38 152.176 102.779L153.09 101.86C153.603 102.511 153.344 104.249 153.344 104.249Z" fill="#026CB6"/><path fill-rule="evenodd" clip-rule="evenodd" d="M134.433 125.085L138.095 121.403L148.44 146.34L146.794 147.995L134.433 125.085Z" fill="#B2DEF0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M130.02 120.74L133.65 117.09L108.846 106.633L107.247 108.241L130.02 120.74Z" fill="#B2DEF0"/><path fill-rule="evenodd" clip-rule="evenodd" d="M115.485 139.661L116.057 137.518L121.505 132.041L123.142 133.686L117.681 139.177L115.485 139.661Z" fill="#026CB6"/><path d="M116.522 138.67L117.313 138.499L122.094 133.692L121.504 133.099L116.723 137.906L116.522 138.67Z" fill="white"/></g></g><defs><filter id="filter0_d_1224_19063" x="53" y="47" width="79.3334" height="86" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="2"/><feGaussianBlur stdDeviation="1.5"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1224_19063"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1224_19063" result="shape"/></filter><filter id="filter1_d_1224_19063" x="102.262" y="96.4961" width="58.235" height="58.5054" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="2"/><feGaussianBlur stdDeviation="2"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1224_19063"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1224_19063" result="shape"/></filter></defs></svg>';

    var MODAL_CONFIG = {
        identifier: 'viajantes',
        title: 'Você pode perder essa oferta!',
        description: 'Os voos que você selecionou podem mudar de preço a qualquer momento. Finalize adicionando os passageiros e garanta o valor atual',
        continueButtonText: 'Continuar e garantir tarifa',
        giveUpButtonText: 'Desistir mesmo assim',
        icon: iconTravel,
    };

    function initAbandonmentModal() {
        console.log('[AT] Injecting booking flow abandonment modal - Viajantes.');

        addListenerToGoHomeButton();
        resetInactivityTimer();
        listenersToResetInactivityTimer();
        observerHeaderChange();
        injectCustomStyle();
    }

    function getCurrentStep() {
        var el = document.querySelector(SELECTORS.activeBreadcrumb);
        return el ? (el.ariaLabel || '') : '';
    }

    function addListenerToGoHomeButton() {
        var goHomeButton = document.querySelectorAll(SELECTORS.buttonGoHome);

        if (goHomeButton) {
            goHomeButton.forEach(function (button) {
                button.classList.add(BUTTON_GO_HOME_FLAG);

                button.addEventListener('click', function (event) {
                    if (event.isAbandonmentModalTriggered) {
                        console.log('[AT] User confirmed give up of booking flow. Redirecting to home page.');
                        return;
                    }

                    event.preventDefault();
                    console.log('[AT] User clicked go home button, showing booking flow abandonment modal.');
                    showModalAbandonment(false);
                });
            });
        }
    }

    function resetInactivityTimer() {
        clearTimeout(INACTIVITY_TIMEOUT);

        INACTIVITY_TIMEOUT = setTimeout(function () {
            console.log('[AT] User is inactive, showing booking flow abandonment modal.');
            showModalAbandonment();
        }, MAXIMUM_INACTIVITY_TIME);
    }

    function listenersToResetInactivityTimer() {
        var listeners = ['keydown', 'click', 'scroll'];

        listeners.forEach(function (listener) {
            document.addEventListener(listener, function () {
                resetInactivityTimer();
            });
        });
    }

    function showModalAbandonment(isTriggeredByInactivity) {
        if (isTriggeredByInactivity === undefined) {
            isTriggeredByInactivity = true;
        }

        if (checkIfModalIsOpen()) {
            console.log('[AT] Modal is already open.');
            return;
        }

        var currentStep = getCurrentStep();

        if (currentStep !== EXPECTED_STEP) {
            if (!isTriggeredByInactivity) {
                var buttonGoHome = document.querySelectorAll(SELECTORS.buttonGoHome);
                var targetButton = buttonGoHome[1] || buttonGoHome[0];
                if (targetButton) {
                    targetButton.dispatchEvent(eventForGiveupModalWhenTriggeredByRedirect);
                }
            }
            return;
        }

        appendDefaultModal(isTriggeredByInactivity, MODAL_CONFIG);
    }

    function observerHeaderChange() {
        var mainElement = document.querySelector('main');

        if (!mainElement) {
            console.log('[AT] Main element not found.');
            return;
        }

        var observerHeader = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes.length > 0 || mutations[i].removedNodes.length > 0) {
                    var buttonGoHome = document.querySelector(SELECTORS.buttonGoHome);

                    if (buttonGoHome && !buttonGoHome.classList.contains(BUTTON_GO_HOME_FLAG)) {
                        addListenerToGoHomeButton();
                    }
                }
            }
        });

        observerHeader.observe(mainElement, { childList: true });
    }

    function appendDefaultModal(isTriggeredByInactivity, modalConfig) {
        if (!modalConfig) {
            console.log('[AT] Modal config not found.');
            return;
        }

        console.log('[AT] Appending default modal.');

        removeModal();

        var labelTypeModal = getLabelAnalytics(isTriggeredByInactivity, modalConfig);
        analyticsEvent(labelTypeModal);

        var defaultModal = document.createElement('div');
        defaultModal.classList.add('abandonmentModalInject');

        defaultModal.appendChild(getHtmlForDefaultModal());

        defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_icon]', modalConfig.icon);
        defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_title]', modalConfig.title);
        defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_description]', modalConfig.description);
        defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_continueButtonText]', modalConfig.continueButtonText);

        if (isTriggeredByInactivity) {
            defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_giveUpButtonText]', 'Voltar');
        } else {
            defaultModal.innerHTML = defaultModal.innerHTML.replace('[replace_giveUpButtonText]', modalConfig.giveUpButtonText);
        }

        defaultModal.querySelector('.abandonmentModal__button--continue').addEventListener('click', function () {
            analyticsEvent(labelTypeModal + ' - Ação - Continuar');
            removeModal();
        });

        defaultModal.querySelector('.abandonmentModal__button--giveup').addEventListener('click', function () {
            analyticsEvent(labelTypeModal + ' - Ação - Desistir');

            if (!isTriggeredByInactivity) {
                var buttonGoHome = document.querySelectorAll(SELECTORS.buttonGoHome);
                var targetButton = buttonGoHome[1] || buttonGoHome[0];
                if (targetButton) {
                    targetButton.dispatchEvent(eventForGiveupModalWhenTriggeredByRedirect);
                }
                return;
            }

            removeModal();
        });

        document.body.appendChild(defaultModal);
    }

    function getHtmlForDefaultModal() {
        var modal = document.createElement('div');
        modal.classList.add('abandonmentModal__modal');

        modal.innerHTML = '<div class="abandonmentModal__icon">[replace_icon]</div>'
            + '<h3 class="abandonmentModal__title">[replace_title]</h3>'
            + '<p class="abandonmentModal__subtitle">[replace_description]</p>'
            + '<div class="abandonmentModal__buttons">'
            + '<button class="abandonmentModal__button abandonmentModal__button--continue">[replace_continueButtonText]</button>'
            + '<button class="abandonmentModal__button abandonmentModal__button--giveup">[replace_giveUpButtonText]</button>'
            + '</div>';

        return modal;
    }

    function getLabelAnalytics(isTriggeredByInactivity, modalConfig) {
        var labelTypeModal = 'Modal por redirecionamento - ' + modalConfig.identifier;

        if (isTriggeredByInactivity) {
            labelTypeModal = 'Modal por inatividade - ' + modalConfig.identifier;
        }

        return labelTypeModal;
    }

    function checkIfModalIsOpen() {
        return !!document.querySelector('.abandonmentModalInject');
    }

    function removeModal() {
        var abandonmentModal = document.querySelector('.abandonmentModalInject');

        if (abandonmentModal) {
            abandonmentModal.remove();
        }
    }

    function injectCustomStyle() {
        if (document.getElementById('abandonmentModalStyle-viajantes')) return;

        var style = document.createElement('style');
        style.id = 'abandonmentModalStyle-viajantes';

        style.innerHTML = '.abandonmentModalInject {align-items: center;background: rgba(0, 0, 0, 0.5);display: flex;justify-content: center;inset: 0px;position: fixed;z-index: 1089;gap: 20px;}.abandonmentModal__modal {background-color: #FFFFFF;padding: 24px;border-radius: 8px;width: 384px;display: flex;flex-direction: column;align-items: center;gap: 24px;box-sizing: border-box;}.abandonmentModal__icon {height: 200px;width: 200px;}.abandonmentModal__title {font-family: "Helvetica Neue", Arial, sans-serif;font-weight: 400;font-size: 24px;line-height: 100%;letter-spacing: 0px;text-align: center;vertical-align: middle;color: #026CB6;margin: 0px;}.abandonmentModal__subtitle {font-family: "Helvetica Neue", Arial, sans-serif;font-weight: 400;font-size: 16px;line-height: 100%;letter-spacing: 0px;text-align: center;vertical-align: middle;color: #606060;margin: 0px;}.abandonmentModal__buttons {width: 100%;}.abandonmentModal__button {width: 100%;min-height: 48px;text-align: center;padding: 12px 16px;border: none;border-radius: 8px;cursor: pointer;font-family: "Helvetica Neue", Arial, sans-serif;font-weight: 400;font-size: 16px;line-height: 24px;}.abandonmentModal__button--continue {background-color: #026CB6;color: #FFFFFF;}.abandonmentModal__button--giveup {background-color: transparent;color: #026CB6;margin-top: 8px;}';

        document.head.appendChild(style);
    }

    function analyticsEvent(label) {
        if (label === undefined || !label) {
            console.log('[AT] Missing parameters for analytics event.');
            return;
        }

        var labelEvent = 'AT_modal_abandono ' + label;

        console.log('[AT] Analytics event triggered:', labelEvent);

        (function () {
            var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
            if (!s || typeof s.tl !== 'function') return;

            s.linkTrackVars = 'events,eVar82';
            s.linkTrackEvents = 'event90';
            s.events = 'event90';
            s.eVar82 = labelEvent;

            s.tl(true, 'o', 'target_activity_action');
        })();
    }

    if (window.abandonmentModalViajantesInjected) {
        console.log('[AT] Abandonment modal Viajantes already injected.');
        return;
    }

    var isReady = document.readyState === 'complete' || document.readyState === 'interactive';

    if (isReady) {
        initAbandonmentModal();
    } else {
        document.addEventListener('DOMContentLoaded', initAbandonmentModal);
    }

    window.abandonmentModalViajantesInjected = true;
})();
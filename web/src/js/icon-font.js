export default class IconFont {
    constructor() {
        document.querySelectorAll('[data-icon]').forEach(async (elem) => {
            const icon = elem.dataset.icon;
            delete elem.dataset.icon;
            elem.classList.add('icon-js');

            const img = document.createElement('img');
            import(/* webpackMode: "eager" */ `../img/${icon}.svg`).then(module => {
                img.src = module.default;
                elem.appendChild(img);
            });
        });
    }
};

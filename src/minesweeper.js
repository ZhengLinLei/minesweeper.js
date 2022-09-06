// Author: Zheng Lin Lei

// Minesweeper

// Add custom css with JS
const addCSS = css => document.head.appendChild(document.createElement("style")).innerHTML=css;

// Change hover color
function increase_brightness(hex, percent){
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(hex.length == 3){
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
       ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
       ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

// Random Value
function getMultipleRandom(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
  
    return shuffled.slice(0, num);
}

function fontLoader(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';

    //link.href = 'http://fonts.googleapis.com/css?family=Oswald&effect=neon';
    link.href = url;

    document.head.appendChild(link);

}

class Minesweeper {
    
    // Config
    childConfig = {
        size: 50,
        color: "#000000",
        fontSize: "relative", // Or change to px number
        alphaColor: [''],
        font: "https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap",
        fontName: "'Orbitron', sans-serif",
        icon: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0",
        iconClass: "material-symbols-outlined",
        iconName: "contrast"
    }

    // Create the element
    constructor (id, width = 10, height = 10, mines = 5, config = null) {

        // Create custom childConfig
        if (!config && typeof config == Object) {
            let arr_ = Object.entries(config);

            // Change each value
            arr_.forEach(e => {
                this.childConfig[e[0]] = e[1];
            });
        }

        this.parentElement = document.getElementById(id);

        // Add Styles
        this.parentElement.style.border = "1px solid black"

        this.configElement = {
            width: width,
            height: height,
            mines: mines,
            child: {}
        }

        // Load Font
        fontLoader(this.childConfig.font);
        fontLoader(this.childConfig.icon);

        // Add custom Styles
        let cssG_ = `
            #${id} > .m_child{
                display: flex;
                justify-content: center;
                background-color: #ffffff;
                font-size: ${(this.childConfig.fontSize == "relative")? "1.1rem": this.childConfig.fontSize+"px"};
                position: relative;
                font-weight: 700;
                align-items: center;
                font-family: ${this.childConfig.fontName}
            }
            #${id} > .m_child[ref="1"]{
                color: blue;
            }
            #${id} > .m_child[ref="2"]{
                color: green;
            }
            #${id} > .m_child.active::after{
                opacity: 0;
            }
            #${id} > .m_child::after{
                content: "";
                cursor: pointer;
                position: absolute;
                width: 100%;
                height: 100%;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                background-color: ${this.childConfig.color};
                z-index: 9;
                transition: 0.2s;
            }

            #${id} > .m_child:hover::after{
                background-color: ${increase_brightness(this.childConfig.color, 10)} !important;
            }
        `;

        addCSS(cssG_);

        // Create virtual table game
        this.virtualGame = {
            _mines: this.configElement.mines
        };

        // Render the element window
        this.renderElement();
    }

    randomMines (num) {

        let arr_ = [];
        getMultipleRandom(Object.values(this.configElement.child), num).forEach(el => {
            arr_.push([parseInt(el.getAttribute('n1')), parseInt(el.getAttribute('n2')), el])
        });

        return arr_;
    }
    openEmpty (x, y, el) {

    }
    renderElement () {
        this.parentElement.style.width = `${this.configElement.width * this.childConfig.size}px`; 
        this.parentElement.style.height = `${this.configElement.height * this.childConfig.size}px`;

        // Gap and display grid
        this.parentElement.style.display = "grid"
        this.parentElement.style.gridTemplateRows = `repeat(${this.configElement.height}, 1fr)`;
        this.parentElement.style.gridTemplateColumns = `repeat(${this.configElement.width}, 1fr)`;
        
        // Child Element
        this.childConfig.count = this.configElement.width * this.configElement.height;
        for (let i = 0; i < this.configElement.width; i++) {

            for (let e = 0; e < this.configElement.height; e++) {
                // Add to father element
                let el = document.createElement('div');
                el.id = `m_${e}_${i}`;
                el.classList.add('m_child')
                el.setAttribute('n1', e);
                el.setAttribute('n2', i);;

                // el.style.backgroundColor = this.childConfig.color;
                // el.style.display = "flex";
                // el.style.justifyContent = "center";
                // el.style.alignItems = "center";

                el.addEventListener('click', () => this.childClick(e, i, el));
                // el.innerHTML = "0"

                this.parentElement.appendChild(el);

                this.configElement.child[`_${e}_${i}`] = el;

                // Overlap virtual game with 0
                this.virtualGame[`_${e}_${i}`] = null;
                el.setAttribute('ref', 0);
            }
        }

        console.log(this.configElement.child);
        console.log(Object.values(this.configElement.child))

        // Create Mines
        let mines_arr = this.randomMines(this.configElement.mines);
        mines_arr.forEach(e => {

            let eleC = document.createElement('span');
            eleC.classList.add(this.childConfig.iconClass);
            eleC.innerHTML = this.childConfig.iconName;

            e[2].appendChild(eleC);

            // Add mines to the virtual game
            this.virtualGame[`_${e[0]}_${e[1]}`] = 9;

            // Create numbers around the mine
            // Reload
            let x = e[0];
            let y = e[1];
            // 0 1 2
            // 3   4
            // 5 6 7

            for(let j = 0; j < 8; j++){
                if(j == 0){
                    y -= 1;
                    x -= 1;
                }
                else if([1, 2, 6, 7].includes(j)){
                    x += 1;
                }
                else if(j == 3 || j == 5){
                    y += 1;
                    x -= 2;
                }
                else if(j == 4){
                    x += 2;
                }
                // Check borders
                if(x >= 0 && y >= 0 && x <= this.configElement.width-1 && y <= this.configElement.height-1){
                    if(!this.virtualGame[`_${x}_${y}`] || this.virtualGame[`_${x}_${y}`] < 9){
                        if(this.virtualGame[`_${x}_${y}`] == null){
                            this.virtualGame[`_${x}_${y}`] = 0;
                        }
                        this.virtualGame[`_${x}_${y}`] += 1;


                        // Create reference for CSS
                        this.configElement.child[`_${x}_${y}`].setAttribute('ref', this.virtualGame[`_${x}_${y}`]);
                    }
                }
            }
        });

        // console.log(this.virtualGame);
        Object.values(this.configElement.child).forEach(e => {
            console.log(e)
            e.innerHTML = this.virtualGame[`_${e.getAttribute('n1')}_${e.getAttribute('n2')}`];
        });
    }

    // Square Clicked
    childClick (n1, n2, e) {
        e.classList.add('active');
    }
}


function $(selector, container) {
    return (container || document).querySelector(selector);
}

(function(){
    var root = self;
    var _ = root.Life = function(seed) {
        this.seed = seed;
        this.height = seed.length;
        this.width = seed[0].length;
        this.prevBoard = [];
        this.board = cloneArray(seed);
    }

    _.prototype = {
        next: function(){
            this.prevBoard = cloneArray(this.board);
            for(var y=0; y < this.height; y++){
                for(var x = 0; x < this.width; x++) {
                    var neighbors = this.aliveNeighbors(this.prevBoard, x, y);
                    var alive = !!this.board[y][x];
                    if(alive) {
                        if(neighbors < 2 || neighbors > 3) {
                            this.board[y][x] = 0;
                        }
                    }
                    else {
                        if(neighbors === 3){
                            this.board[y][x] = 1;
                        }
                    }
                }
            }
        },

        aliveNeighbors: function(array, x, y) {
            var 
                prevRow = array[y-1] || [],
                nextRow = array[y+1] || [];
            return [
                prevRow[x-1], prevRow[x], prevRow[x+1],
                array[y][x-1], array[y][x+1],
                nextRow[x-1], nextRow[x], nextRow[x+1]
            ].reduce(function(prev, cur) {
                return prev + +!!cur;
            }, 0);
        },

        toString: function(){
            return this.board.map(function(row){ return row.join(' ');}).join('\n')
        }
    };

    //Helpers
    function cloneArray(array) {
        // we can use slice to shallow cope the arry
        return array.slice().map(function(row){
            return row.slice();
        });
    }
})();

//var game = new Life([
//    [0, 0, 0, 0, 0],
//    [0, 0, 1, 0, 0],
//    [0, 0, 1, 0, 0],
//    [0, 0, 1, 0, 0],
//    [0, 0, 0, 0, 0],
//]);
//
//console.log(game + '');
//game.next();
//console.log(game + '');

(function(){
    var root = self;
    var _ = root.LifeView = function(table, size) {
        this.grid = table;
        this.size = size;
        this.started = false;
        this.autoplay = false;
    }

    _.prototype = {
        createGrid: function() {
            var fragment = document.createDocumentFragment();
            this.grid.innerHTML = '';
            this.checkboxes = [];
            var that = this;
            for(var y = 0; y < this.size; y++) {
                var row = document.createElement('tr');
                this.checkboxes[y] = [];
                for(var x = 0; x < this.size; x++) {
                    var cell = document.createElement('td');
                    var checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    this.checkboxes[y][x] = checkbox;

                    cell.appendChild(checkbox);
                    row.appendChild(cell);
                }
                fragment.appendChild(row);
            }
            this.grid.addEventListener('change', function(event){
                if(event.target.nodeName.toLowerCase() === 'input'){
                    that.started = false;
                }
            });
            this.grid.appendChild(fragment);
        },

        get boardArray(){
            return this.checkboxes.map(function(row) {
                return row.map(function(checkbox) {
                    return +checkbox.checked;
                });
            });
        },

        play: function(){
            this.game = new Life(this.boardArray);
            this.started = true;
        },

        next: function(){
            var that = this;
            if(!this.started || !this.game) {
                this.play();
            }
            this.game.next();
            for(var y = 0; y < this.size; y++) {
                for(var x=0; x<this.size; x++) {
                    this.checkboxes[y][x].checked = this.game.board[y][x];
                }
            }
            if(this.autoplay) {
                this.timer = setTimeout(function(){
                    that.next();
                }, 1000);
            }
        }
    }
})();

var lifeView = new LifeView(document.querySelector('#grid'), 12);
lifeView.createGrid();

(function(){
    var buttons = {
        next: $('button.next')
    };
    buttons.next.addEventListener('click', function(event) {
        lifeView.next();
    });

    $('#autoplay').addEventListener('change', function(event) {
        // when button was created by button tag, use textContent to change it's value
        // when button was created by input type=button or submit, use value to change it's value
        buttons.next.textContent = this.checked ? 'Start' : 'Next';
        lifeView.autoplay = this.checked;
        if(!this.checked) {
            clearTimeout(lifeView.timer);
        }
    });

})()



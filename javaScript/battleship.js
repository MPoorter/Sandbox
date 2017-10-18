(function () {
    'use strict';
    var lettersArray = ["A", "B", "C", "D", "E", "F", "G"];
    var controller = {
        guess: function (guess) {
            guess = isValid(guess);
            if (guess !== undefined) {
                model.fire(guess);
            } else {
                alert("Please use inputs of the type \"A0\" or \"a0\" with values displayed on the board.");
            }
        }
    };

    var view = {
        displayMessage: function (msg) {
            document.getElementById("messageArea").innerHTML = msg;
        },

        displayHit: function (target) {
            document.getElementById(target).setAttribute("class", "hit");
        },

        displayMiss: function (target) {
            document.getElementById(target).setAttribute("class", "miss");
        }
    };

    var model = {
        boardSize: 7,
        shipLength: 3,
        numberOfShips: 3,
        ships: [],
        shipsSunk: 0,
        fire: function (target) {
            for (var j = 0; j < this.ships.length; j++) {
                var ship = this.ships[j];
                var index = this.ships[j].locations.indexOf(target);
                if (index >= 0) {
                    ship.hits[index] = "hit";
                    view.displayHit(target);
                    if (isSunk(ship)) {
                        this.shipsSunk++;
                        view.displayMessage("You sunk my battleship!");
                    } else {
                        view.displayMessage("HIT!");
                    }
                    if (this.shipsSunk === this.numberOfShips) {
                        if (confirm("Dratz, you sunk all my battleships. Play again?")) {
                            if (document.getElementById("panel1")) {
                                $("#panel1").load("sandbox/battleship.html");
                            } else {
                                window.location.reload();
                            }
                        } else {
                            view.displayMessage("Game over. You won!");
                        }
                    }
                    return;
                }
            }
            view.displayMessage("Haha, missed");
            view.displayMiss(target);
        },
        initShips: function () {
            var shipLocations = [];
            var bannedLocations = [];
            for (var i = 0; i < this.numberOfShips; i++) {
                var newShipLocations = [];
                do {
                    newShipLocations = this.generateShip();
                } while (this.collision(newShipLocations, bannedLocations));
                helperAddToBannedLocations(newShipLocations).forEach(function (e) {
                    if (bannedLocations.indexOf(e) < 0) {
                        bannedLocations.push(e);
                    }
                });
                shipLocations.push({locations: newShipLocations, hits: ['', '', ''], sunk: false});
            }
            return shipLocations;

        },
        generateShip: function () {
            var direction = Math.floor(Math.random() * 2);
            var row, col;

            if (direction) {
                row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
                col = Math.floor(Math.random() * this.boardSize);
            } else {
                row = Math.floor(Math.random() * this.boardSize);
                col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
            }

            var newShipLocations = [];

            for (var i = 0; i < this.shipLength; i++) {
                if (direction) {
                    newShipLocations.push(lettersArray[col] + (row + i));
                } else {
                    newShipLocations.push(lettersArray[(col + i)] + row);
                }
            }

            return newShipLocations;
        },
        collision: function (newShipLocations, shipLocations) {
            for (var i = 0; i < shipLocations.length; i++) {
                if (newShipLocations.indexOf(shipLocations[i]) >= 0) {
                    return true;
                }
            }
            return false;
        }
    };

    function init() {
        var guessInput = document.getElementById("guessInput");
        var fireButton = document.getElementById("fireButton");
        initTable();
        guessInput.onkeypress = function (e) {
            if (e.keyCode === 13) {
                fireButton.click();
                return false;
            }
        };
        fireButton.addEventListener("click", function () {
            controller.guess(guessInput.value);
            guessInput.value = "";
        });


        model.ships = model.initShips();
    }

    function initTable() {
        var board = document.getElementById("board");
        var table = document.createElement("table");
        for (var i = 0; i < 7; i++) {
            var tr = document.createElement("tr");
            for (var j = 0; j < 7; j++) {
                var td = document.createElement("td");
                var id = lettersArray[i] + j;
                td.setAttribute("id", id);
                td.addEventListener("click", function (e) {
                    controller.guess(e.target.getAttribute("id"));
                });
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        board.insertBefore(table, board.children[1]);
    }

    function isSunk(ship) {
        for (var i = 0; i < ship.hits.length; i++) {
            if (ship.hits[i] !== "hit") {
                return false;
            }
        }
        return true;
    }

    function helperAddToBannedLocations(shipLocations) {
        var bannedLocationsArray = [];
        var horizontal = shipLocations[0].charAt(0) === shipLocations[1].charAt(0);
        var startingPositionX = shipLocations[0].charAt(1);
        var startingPositionY = lettersArray.indexOf(shipLocations[0].charAt(0));
        startingPositionX--;
        startingPositionY--;

        for (var j = 0; j < 3; j++) {
            for (var i = 0; i < 5; i++) {
                if (horizontal && startingPositionY + j >= 0 && startingPositionX + i >= 0) {
                    bannedLocationsArray.push(lettersArray[(startingPositionY + j)] + (startingPositionX + i));
                } else if (!horizontal && startingPositionY + i >= 0 && startingPositionX + j >= 0) {
                    bannedLocationsArray.push(lettersArray[(startingPositionY + i)] + (startingPositionX + j));
                }

            }

        }
        return bannedLocationsArray;

    }

    function isValid(guess) {
        var letter = guess.charAt(0).toUpperCase();
        var number = parseInt(guess.charAt(1));
        if (guess.length === 2 && lettersArray.indexOf(letter) >= 0 && !isNaN(number) && number >= 0 && number < model.boardSize) {
            return letter + number;
        }
    }

    init();

})();
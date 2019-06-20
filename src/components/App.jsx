import React, { useState } from 'react'
import _ from 'lodash'


// TODO: Add logging -> time travelling
// TODO: Networking with WebRTC, startign games on a chatroom
// TODO: UI and Animations
// TODO: Save and load a game state to an from a JSON file
// TODO(Maybe): Leaderboard of all games on a central server

const DIMENSION = 6

const COLORS = {
    BLACK: 'BLACK',
    WHITE: 'WHITE'
}

const BOX_STATES = {
    EMPTY: 'EMPTY',
    WALL: 'WALL',
    [COLORS.BLACK]: COLORS.BLACK,
    [COLORS.WHITE]: COLORS.WHITE,
}

const INIT_POS = [
    {
        x: DIMENSION / 2 - 1,
        y: DIMENSION / 2 - 1,
        color: COLORS.BLACK
    },
    {
        x: DIMENSION / 2,
        y: DIMENSION / 2,
        color: COLORS.BLACK
    },
    {
        x: DIMENSION / 2 - 1,
        y: DIMENSION / 2,
        color: COLORS.WHITE
    },
    {
        x: DIMENSION / 2,
        y: DIMENSION / 2 - 1,
        color: COLORS.WHITE
    },
]

const createBoard = () => {
    var INITIAL_BOARD = _.times(DIMENSION, () => (_.times(DIMENSION, () => BOX_STATES.EMPTY)));

    INIT_POS.map(({ x, y, color }) => {
        // console.log(x, y, color);
        INITIAL_BOARD[y][x] = color;
    })

    return INITIAL_BOARD;

}

const DIRECTIONS = {
    TOP: ({ x, y }) => ({ x: x, y: y - 1 }),
    BOTTOM: ({ x, y }) => ({ x: x, y: y + 1 }),
    LEFT: ({ x, y }) => ({ x: x - 1, y: y }),
    RIGHT: ({ x, y }) => ({ x: x + 1, y: y }),

    TOP_LEFT: ({ x, y }) => ({ x: x - 1, y: y - 1 }),
    TOP_RIGHT: ({ x, y }) => ({ x: x + 1, y: y - 1 }),
    BOTTOM_LEFT: ({ x, y }) => ({ x: x - 1, y: y + 1 }),
    BOTTOM_RIGHT: ({ x, y }) => ({ x: x + 1, y: y + 1 }),

}

const App = () => {
    const [board, setBoard] = useState(createBoard())
    const [activePlayer, setActivePlayer] = useState(COLORS.BLACK)

    const [notif, setNotif] = useState("")

    React.useEffect(() => {
        console.log(board)
    })


    const outputCoord = ({ x, y }) => `(${x + 1}, ${y + 1})` // For human reading

    const getOtherPlayer = player => player == COLORS.BLACK ? COLORS.WHITE : COLORS.BLACK; // The player waiting

    const isValidCoord = ({ x, y }) => ((x < DIMENSION) && (x > -1) && (y < DIMENSION) && (y > -1)) // Is the coordinate inside the board

    const isEmptyCoord = ({ x, y }) => (board[y][x] == BOX_STATES.EMPTY) // Is it empty right now

    const getChip = ({ x, y }) => board[y][x]

    // TODO: Update the state via hook and not mutation
    const setChip = ({ x, y, value }) => board[y][x] = value
    // const setChip = ({ x, y, value }) => setBoard(Object.assign([...board], {[y]: [...board[y].slice(0, x), value, board[y].slice((x+1))]}))


    const getTotalPieces = (boxState) => _.chain(board).map(e => _.countBy(e, i => i == boxState)).map(e => e.true).sum().value()

    // TODO: On every board update, keep a counter of possible moves. If the current player has no possible moves, notify and switch to the other player.
    const isValidMove = (pos) => {

        // - search in each direction, and 'at least one' should satisfy the following
        // - adjacent cell should have a chip of the opposite color
        // - the next adjacent cell in the same direction should either be :
        // 1) A chip of the same color, in which case the next adjacent is sought.
        // 2) A chip of different color, and the search terminates, returning true.
        // 3) If it is either a) a wall, or b) an empty, the search terminates and returns false


        if (isValidCoord(pos) && isEmptyCoord(pos)) {

            let validDirections = _.map(DIRECTIONS, (dir, i) => {

                let adj = dir(pos) // computing the adjacent in that direction

                // Check the first adjacent
                if (isValidCoord(adj)) {
                    switch (getChip(adj)) {
                        // If either empty or the same color as active player, a move is not possible
                        case activePlayer:
                        case BOX_STATES.EMPTY:
                            return 0;

                        // If a chip of the opposite color to the active player is present, it, or a series of that 
                        // colored chips must be followed by a chip of the color of the player for the move to be valid
                        case getOtherPlayer(activePlayer):
                            while (isValidCoord(adj) && !isEmptyCoord(adj) && getChip(adj) == getOtherPlayer(activePlayer)) {
                                adj = dir(adj)
                            }

                            return (isValidCoord(adj) && !isEmptyCoord(adj) && (getChip(adj) == activePlayer)) ? 1 : 0
                    }
                }

            })

            return (_.sum(validDirections) > 0)
        }

        return false
        // check if piece at X, Y by player activePlayer can be placed. 
    }

    const runMove = (pos) => {

        _.map(DIRECTIONS, (dir, i) => {

            let adj = dir(pos) // computing the adjacent in that direction

            if (isValidCoord(adj)) {
                switch (getChip(adj)) {
                    // If either empty or the same color as active player, a move is not possible
                    case activePlayer:
                    case BOX_STATES.EMPTY:
                        return 0;

                    // If a chip of the opposite color to the active player is present, it, or a series of that 
                    // colored chips must be followed by a chip of the color of the player for the move to be valid
                    case getOtherPlayer(activePlayer):
                        while (isValidCoord(adj) && !isEmptyCoord(adj) && getChip(adj) == getOtherPlayer(activePlayer)) {
                            adj = dir(adj)
                        }

                        if (isValidCoord(adj) && !isEmptyCoord(adj) && (getChip(adj) == activePlayer)) {

                            // returning back to the original adjacent to begin flippig chips
                            adj = pos

                            while (getChip(adj) != activePlayer) {
                                setChip({ ...adj, value: activePlayer })
                                adj = dir(adj)
                            }


                        }
                }


            }
        })
        setActivePlayer(getOtherPlayer(activePlayer))
        //  pushNotif("Invalid Square. Please click on a valid Square.")

        checkIfWon()
    }

    const checkIfWon = () => {
        if (!getTotalPieces(BOX_STATES.EMPTY)) {
            setTimeout(() => {
                let n_black = getTotalPieces(BOX_STATES.BLACK)
                let n_white = getTotalPieces(BOX_STATES.WHITE)

                alert("Winner is the color " + (n_black > n_white ? COLORS.BLACK : COLORS.WHITE).toLocaleLowerCase() + " by " + Math.abs(n_black - n_white) + " chips")
            }, 2000)
        }
    }

    const pushNotif = text => {
        setNotif(text)
        setTimeout(() => {
            setNotif("")
        }, 2000)
    }

    return (

        <div className="section">
            <div className="container text-center">
                <div className="title center">Othello Game</div>
                <div className="subtitle center bold">Turn: {activePlayer.toLocaleLowerCase()}</div>
                <div className="level">
                    <div className="level-item gap">
                        <div className="button is-light">
                            White: {getTotalPieces(BOX_STATES.WHITE)}
                        </div>
                    </div>
                    <div className="level-item gap">
                        <div className="button is-dark">
                            Black: {getTotalPieces(BOX_STATES.BLACK)}
                        </div>
                    </div>
                </div>
                {notif.length > 0 &&
                    <div class="notification is-info">
                        {notif}
                        <button class="delete" onClick={() => { setNotif("") }}></button>
                    </div>
                }

                <div className="board">

                    {/* {JSON.stringify(Board)} */}

                    {board.map((col, y) =>
                        <div key={y} className="row">
                            {col.map((cell, x) =>
                                <div key={x} className="cell">
                                    <div className={`cont state-${cell.toLowerCase()} ${isValidMove({ x, y }) ? ' isValidMove highlight-' + activePlayer.toLocaleLowerCase() : ''}`} onClick={() => (isValidMove({ x, y }) && runMove({ x, y }))}>
                                        {/* {outputCoord({ x, y })} */}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App
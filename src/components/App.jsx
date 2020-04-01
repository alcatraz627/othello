import React, { useState } from 'react'
import _ from 'lodash'


// TODO: Add logging -> time travelling
// TODO: Networking with WebRTC, startign games on a chatroom
// TODO: UI and Animations
// TODO: Save and load a game state to an from a JSON file
// TODO(Maybe): Leaderboard of all games on a central server

const DIMENSION = 4

const DEBUG = false

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

// const INIT_POS = [
//     {
//         x: 1,
//         y: 2,
//         color: COLORS.BLACK
//     },
//     {
//         x: 1,
//         y: 3,
//         color: COLORS.BLACK
//     },
//     {
//         x: 1,
//         y: 4,
//         color: COLORS.BLACK
//     },
//     {
//         x: 1,
//         y: 5,
//         color: COLORS.BLACK
//     },
//     {
//         x: 2,
//         y: 3,
//         color: COLORS.WHITE
//     },
//     {
//         x: 2,
//         y: 4,
//         color: COLORS.WHITE
//     },
//     {
//         x: 1,
//         y: 6,
//         color: COLORS.WHITE
//     },
// ]

// Information shape of the moves to track
const moveObj = (player, coins) => ({player, coins})

const createBoard = () => {
    var INITIAL_BOARD = _.times(DIMENSION, () => (_.times(DIMENSION, () => BOX_STATES.EMPTY)));

    INIT_POS.map(({ x, y, color }) => {
        // console.log(x, y, color);
        INITIAL_BOARD[y][x] = color;
    })

    return INITIAL_BOARD;

}

const DIRECTIONS = {
    TOP_LEFT: ({ x, y }) => ({ x: x - 1, y: y - 1 }),
    TOP: ({ x, y }) => ({ x: x, y: y - 1 }),
    TOP_RIGHT: ({ x, y }) => ({ x: x + 1, y: y - 1 }),

    RIGHT: ({ x, y }) => ({ x: x + 1, y: y }),

    BOTTOM_RIGHT: ({ x, y }) => ({ x: x + 1, y: y + 1 }),
    BOTTOM: ({ x, y }) => ({ x: x, y: y + 1 }),
    BOTTOM_LEFT: ({ x, y }) => ({ x: x - 1, y: y + 1 }),

    LEFT: ({ x, y }) => ({ x: x - 1, y: y }),

}

const App = () => {
    const [board, setBoard] = useState(createBoard())
    const [activePlayer, setActivePlayer] = useState(COLORS.BLACK)
    
    const [notif, setNotif] = useState("")

    const [moveHistory, setMoveHistory] = useState([])

    React.useEffect(() => {
        DEBUG && console.log(board)
    })


    const outputCoord = ({ x, y }) => `(${x + 1}, ${y + 1})` // For human reading

    const getOtherPlayer = player => player == COLORS.BLACK ? COLORS.WHITE : COLORS.BLACK; // The player waiting

    const isValidCoord = ({ x, y }) => ((x < DIMENSION) && (x > -1) && (y < DIMENSION) && (y > -1)) // Is the coordinate inside the board

    const isEmptyCoord = ({ x, y }) => (board[y][x] == BOX_STATES.EMPTY) // Is it empty right now

    const getChip = ({ x, y }) => board[y][x]

    // TODO: Update the state via hook and not mutation
    const setChip = ({ x, y, value }) => board[y][x] = value
    // const setChip = ({ x, y, value }) => setBoard(Object.assign([...board], {[y]: [...board[y].slice(0, x), value, board[y].slice((x+1))]}))

    // Record move history
    const pushMove = coins => {setMoveHistory([...moveHistory, moveObj(activePlayer, coins)])}

    const getTotalPieces = (boxState) => _.chain(board).map(e => _.countBy(e, i => i == boxState)).map(e => e.true).sum().value()

    const findValidDirs = (pos) => {
        // - search in each direction, and 'at least one' should satisfy the following
        // - adjacent cell should have a chip of the opposite color
        // - the next adjacent cell in the same direction should either be :
        // 1) A chip of the same color, in which case the next adjacent is sought.
        // 2) A chip of different color, and the search terminates, returning true.
        // 3) If it is either a) a wall, or b) an empty, the search terminates and returns false

        return _.map(DIRECTIONS, (dir, i) => {

            let adj = dir(pos) // computing the adjacent in that direction

            // Check the first adjacent
            if (isValidCoord(adj) && getChip(adj) == getOtherPlayer(activePlayer)) {
                // If a chip of the opposite color to the active player is present, it, or a series of that 
                // colored chips must be followed by a chip of the color of the player for the move to be valid
                while (isValidCoord(adj) && !isEmptyCoord(adj) && getChip(adj) == getOtherPlayer(activePlayer)) {
                    adj = dir(adj)
                }
                return (isValidCoord(adj) && !isEmptyCoord(adj) && (getChip(adj) == activePlayer)) ? 1 : 0
            } else return false
        })

    }
    // TODO: On every board update, keep a counter of possible moves. If the current player has no possible moves, notify and switch to the other player.
    const isValidMove = (pos) => {
        if (isValidCoord(pos) && isEmptyCoord(pos)) {
            // To track all the available directions to convert. Follows the same ordering as DIRECTIONS
            let validDirections = findValidDirs(pos)
            // console.log(`${JSON.stringify(pos)}-> ${JSON.stringify(validDirections)} | ${_.sum(validDirections)}`);
            return (_.sum(validDirections) > 0)
        }
        return false
    }

    const runMove = (pos) => {
        let coinsToFlip = [];

        // Fetch the directions of available flips, assuming that a direction exists for this function to be enabled callind
        let availableDirs = findValidDirs(pos)
            .map((e, i) => (i + 1) * e)
            .filter((e, i) => e)
            .map(e => e - 1)

        // Queue the clicked square for flipping
        setChip({ ...pos, value: activePlayer })

        _.map(availableDirs, (d, i) => {
            // Fetch direction functor for available directions
            let dir = Object.values(DIRECTIONS)[d]
            // let oppdir_i = (i + 4) % 8 // Opposite of current direction, to prevent it from scanning backwards
            let adj = dir(pos) // computing the adjacent in that direction

            if (isValidCoord(adj) && getChip(adj) == getOtherPlayer(activePlayer)) {
                // If a chip of the opposite color to the active player is present, it, or a series of that 
                // colored chips must be followed by a chip of the color of the player for the move to be valid
                // Keep flipping till appropriate
                while (isValidCoord(adj) && !isEmptyCoord(adj) && getChip(adj) == getOtherPlayer(activePlayer)) {
                    coinsToFlip.push(adj)
                    adj = dir(adj) // iterator
                }
            }
        })

        // Flip all coins added to list
        coinsToFlip.map(coord => {setChip({ ...coord, value: activePlayer })} ) 
        pushMove(coinsToFlip) // Push to history

        setActivePlayer(getOtherPlayer(activePlayer))

        checkIfWon()
    }

    const checkIfWon = () => {
        if (!getTotalPieces(BOX_STATES.EMPTY)) {
            setTimeout(() => {
                let n_black = getTotalPieces(BOX_STATES.BLACK)
                let n_white = getTotalPieces(BOX_STATES.WHITE)

                pushNotif("Winner is the color " + (n_black > n_white ? COLORS.BLACK : COLORS.WHITE).toLocaleLowerCase() + " by " + Math.abs(n_black - n_white) + " chips")
            }, 1000)
        }
    }

    const pushNotif = text => {
        setNotif(text)
        setTimeout(() => {
            setNotif("")
        }, 5000)
    }

    return (

        <div className="section">
            <div className="container text-center">

                <div className="columns">
                    <div className="column level level-left">
                        <div className="title left">Othello Game</div>
                        <div className={`subtitle left bold`}>Turn: &nbsp;&nbsp;
                            <div className={`button is-small is-${activePlayer.toLocaleLowerCase() == 'black' ? 'dark' : 'light'}`}>
                                {activePlayer.toLocaleLowerCase()}</div>
                        </div>
                    </div>

                    {/* <div className="column level level-right"> */}

                    <div className="level-right">
                        <div className="button score is-light">
                            {getTotalPieces(BOX_STATES.WHITE)}
                        </div>

                        <div className="button score is-dark">
                            {getTotalPieces(BOX_STATES.BLACK)}
                        </div>

                    </div>
                    {/* </div> */}

                </div>
                {notif.length > 0 &&
                    <div className="notification is-info">
                        {notif}
                        <button className="delete" onClick={() => { setNotif("") }}></button>
                    </div>
                }

                <div className="board">

                    {/* {JSON.stringify(Board)} */}

                    {board.map((col, y) =>
                        <div key={y} className="row">
                            {col.map((cell, x) =>
                                <div key={x} className="cell">
                                    <div className={`cont state-${cell.toLowerCase()} ${isValidMove({ x, y }) ? ' isValidMove highlight-' + activePlayer.toLocaleLowerCase() : ''}`} onClick={() => (isValidMove({ x, y }) && runMove({ x, y }))}>
                                        {outputCoord({ x, y })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <hr />
                <div>
                    {moveHistory.map((e, i) => <div key={i} className={`card history has-background-${e.player == COLORS.BLACK ? 'dark' : 'light'}`}>
                        <div className={`has-text-${e.player == COLORS.BLACK ? 'light' : 'dark'}`}>
                        {e.player} clicked on {outputCoord(e.coins[0])}
                        </div>
                    </div>)}
                </div>
            </div>
        </div>
    )
}

export default App
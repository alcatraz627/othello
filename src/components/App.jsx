import React, { useState } from 'react'
import _ from 'lodash'

const DIMENSION = 8

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

    const outputCoord = ({ x, y }) => `(${x + 1}, ${y + 1})` // For human reading

    const getOtherPlayer = player => player == COLORS.BLACK ? COLORS.WHITE : COLORS.BLACK; // The player waiting

    const isValidCoord = ({ x, y }) => ((x < DIMENSION) && (x > -1) && (y < DIMENSION) && (y > -1)) // Is the coordinate inside the board

    const isEmptyCoord = ({ x, y }) => (board[y][x] == BOX_STATES.EMPTY) // Is it empty right now

    const isValidMove = (pos) => {
        const { x, y } = pos
        // - search in each direction, and 'at least one' should satisfy the following
        // - adjacent cell should have a chip of the opposite color
        // - the next adjacent cell in the same direction should either be :
        // 1) A chip of the same color, in which case the next adjacent is sought.
        // 2) A chip of different color, and the search terminates, returning true.
        // 3) If it is either a) a wall, or b) an empty, the search terminates and returns false

        console.log("\n################")
        console.log("#### BEGIN ####")

        console.log(outputCoord(pos), isValidCoord(pos), isEmptyCoord(pos));

        if (isValidCoord(pos) && isEmptyCoord(pos)) {
            // let validDirections = _.times(Object.keys(DIRECTIONS).length, () => 0)
            let validDirections = _.map(DIRECTIONS, (dir, i) => {

                let adj = dir(pos) // computing the adjacent in that direction
                if (isValidCoord(adj)) {
                    console.log("ADJACENT[0]: ", outputCoord(adj), i)
                    switch (board[adj.y][adj.x]) {
                        case activePlayer:
                        case BOX_STATES.EMPTY:
                            console.log("Nope.");
                            return 0;

                        case getOtherPlayer(activePlayer):
                            while (board[adj.y][adj.x] == getOtherPlayer(activePlayer)) {
                                adj = dir(adj)
                                console.log("ADJACENT[transit]: ", outputCoord(adj), board[adj.y][adj.x])
                            }
                            console.log("ADJACENT[final]", outputCoord(adj), board[adj.y][adj.x])

                            console.log((board[adj.y][adj.x] == activePlayer), isValidCoord(adj), !isEmptyCoord(adj))

                            if ((board[adj.y][adj.x] == activePlayer) && isValidCoord(adj) && !isEmptyCoord(adj)) { return 1 }
                            else return 0;
                    }
                }

            })

            console.log("#### END ####")
            console.log("################\n")
            console.log(validDirections, _.sum(validDirections))
            // return _.includes(validDirections, true)
            return (_.sum(validDirections) > 0)
        }

        return false
        // check if piece at X, Y by player activePlayer can be placed. 
    }

    const runMove = (pos) => {

        if (isValidCoord(pos) && isEmptyCoord(pos)) {
            _.map(DIRECTIONS, (dir, i) => {
                let adj = dir(pos) // computing the adjacent in that direction
                if (isValidCoord(adj)) {
                    switch (board[pos.y][pos.x]) {
                        case activePlayer:
                        case BOX_STATES.EMPTY:
                            return false;

                        case getOtherPlayer(activePlayer):
                            // It is an opposite 
                            break;

                        default:
                            console.log(board[pos.y][pos.x])
                            break;
                    }

                    setActivePlayer(getOtherPlayer(activePlayer))

                    // update checkers

                    console.log(outputCoord(adj), i, isValidCoord(adj))
                }
            })
        } else pushNotif("Invalid Square. Please click on a valid Square.")

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
                                    <div className={`cont state-${cell.toLowerCase()}${isValidMove({ x, y }) ? ' isValidMove' : ''}`} onClick={() => runMove({ x, y })}>
                                        {outputCoord({ x, y })}
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
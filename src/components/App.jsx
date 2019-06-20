import React, {useState} from 'react'
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
        x: DIMENSION/2 - 1,
        y: DIMENSION/2 - 1,
        color: COLORS.BLACK
    },
    {
        x: DIMENSION/2,
        y: DIMENSION/2,
        color: COLORS.BLACK
    },
    {
        x: DIMENSION/2 - 1,
        y: DIMENSION/2,
        color: COLORS.WHITE
    },
    {
        x: DIMENSION/2,
        y: DIMENSION/2 - 1,
        color: COLORS.WHITE
    },
]

const createBoard = () => {
    var INITIAL_BOARD = _.times(DIMENSION, ()=>(_.times(DIMENSION, ()=>BOX_STATES.EMPTY)));

    INIT_POS.map(({x, y, color}) => {
        // console.log(x, y, color);
        INITIAL_BOARD[x][y] = color;
    })
    
    return INITIAL_BOARD;

}


const App = () => {
    const [Board, setBoard] = useState(createBoard())

    return (
        
        <div className="section">
            <div className="container text-center">
                <div className="title">Othello Game</div>
            <div className="board">

                {/* {JSON.stringify(Board)} */}

                {Board.map((col, x) => 
                    <div className="row">
                        {col.map((cell, y) => 
                        <div className="cell">
                            <div className={`cont state-${cell.toLowerCase()}`}>
                                {`${x+1}, ${y+1}`}
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
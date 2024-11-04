import React from "react";
import ReactDOM from "react-dom/client";
import KanbanBoard from './KanbanBoard.jsx'

const AppLayout=()=>{
    return (
        <div>
            <KanbanBoard/>
        </div>
    )
}

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppLayout/>);
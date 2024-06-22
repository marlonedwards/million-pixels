import React from 'react'
import Crop from '../components/Crop.js';
import { useParams } from 'react-router-dom';

export default function Purchase() {
    const { row_col } = useParams();
    const [row, col] = row_col.split('-');


    
    return (
        <div>
            <p>Row: {row}</p>
            <p>Col: {col}</p>
            <Crop />
        </div>
    )
}
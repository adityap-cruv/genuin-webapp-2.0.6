import React from 'react'
import Router from 'next/router';
import Link from 'next/link';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        const { pathname, query } = Router
        if (pathname == '/') {
            window.location.href = process.env.genuinurl
        }
        if(query.video_id !== undefined && query.video_id !== null && query.video_id !== ''){
            window.location.href = `${process.env.hostname}/video/${query.video_id}`
        }
    }

    render() {
        return (
            <div>Welcome</div>
        );
    }
}
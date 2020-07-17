import React from 'react'
import Router from 'next/router';
import Link from 'next/link';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        const { pathname } = Router
        if (pathname == '/') {
            window.location.href = process.env.genuin_url
        }
    }

    render() {
        return (
            <div>Welcome</div>
        );
    }
}
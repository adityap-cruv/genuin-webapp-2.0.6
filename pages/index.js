import React from 'react'
import Router from 'next/router';
import Link from 'next/link';
import { Alert } from 'react-bootstrap';
export default class Home extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        const { pathname, query } = Router
        // if (pathname == '/') {
        //     window.location.href = process.env.genuinurl
        // }
    }

    render() {
        return (
            <Alert variant='primary'>
                This is a primary alert—check it out!
            </Alert>
        );
    }
}
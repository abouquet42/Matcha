import React, { Component } from 'react'
import * as Mdb from 'mdbreact'
import axios from 'axios'
import Slider, { Range, createSliderWithTooltip } from 'rc-slider'
import Tooltip from 'rc-tooltip'
import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import './search.css'
import '../home/card.css'
import { WithContext as ReactTags } from 'react-tag-input'
import SelectSearch from '../selector/orSelectSearch'
import StarRatings from 'react-star-ratings'
import io from 'socket.io-client'
const socket = io('https://localhost:3000', {
    trasnports: ['polling']
})
let wCard = 500
let idMe = localStorage.getItem('id')

/*   Var pour les sliders   */
function CardPerso(props) {
    return (
        <Mdb.CardGroup deck style={{ margin: '15px', marginBottom: '15px' }}>
            {props.datas.map ? props.datas.map((post) =>
                <Mdb.Card id={post.id} key={post.id} className='animated bounceIn' style={{ maxWidth: '350px', minWidth: '180px', marginBottom: '30px' }} data-wow-duration='0.5s'>
                    <a href={'/user?' + post.login}><Mdb.CardImage style={{ height: '200px', width: 'auto' }} src={post.profimg} alt="Mdb.Card image cap" top hover overlay="white-slight"/></a>
                    <Mdb.CardBody>
                        {post.genre === 'Man' ? <Mdb.CardTitle className="h5 nameCard" style={{ color: 'blue' }}>{post.first_name}
                        <StarRatings
                            rating={post.popu / 20}
                            starRatedColor='orange'
                            starDimension='15px'
                            starSpacing='1px'
                            numberOfStars={5}
                            name='rating'
                        />
                        </Mdb.CardTitle> : 
                        <Mdb.CardTitle className="h5 nameCard" style={{ color: 'pink' }}>{post.first_name}
                        <StarRatings
                            rating={post.popu / 20}
                            starRatedColor='orange'
                            starDimension='15px'
                            starSpacing='1px'
                            numberOfStars={5}
                            name='rating'
                        />
                        </Mdb.CardTitle> }
                        <Mdb.CardText style={{ height: '50px', overflow: 'auto' }}>{post.bio}</Mdb.CardText>
                        <div className='divlike'>
                            <Mdb.Media object className='btlike' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATWSURBVGhD3Vpbb9xEGF0ED/DC5QXBM7cfwA/IE1BR1rtpE27J2iYRdygtL0VFpRISogJR0aQUIigSEoJSEJRwCQEh8YRUQgtVJSqgWa+zJEqbjZQN6SZVSIbvOF/i2Pt5ZXt3vase6Ugbz5lvztgz42/GSTULhc6em8ezudvtrHEniN+4xsXtCXvrwzcUMsZ2K6MfsjTj10JGn6e/VQDLVsYYIw5aaXPbePdj13GY1kClUlfkM7l7yPwxMr4kGA5JfQkx8ln9bsTk8MkAd7Kg6b/JxuriqXw6l+FmmgeMcxoSPwgGGkvNGC1uNW/jZhsLSzP7aAhcFBtuAtEW3TSTm68fqqPjKhrHR6TGkqCl6UOqu/tKthMPE11d19Bd+VJqIEnCg9VhXM22ogF3oR06sU54ifVkWjmcAqkZh9leOFCl/qogbUJb03W2WRtrS2xyq1NU0hBbmEj33sp2g0HC5r8n6qY+wnZl0FLXKVeUeWH/oKqM/a7Kw6PKfuBxUVOLEw89oea/+l5VTp52YkmaINIQ09i2F8hzoqQdU8/vU2plRa1j8fQfyt7eL2olQrt45izXJlCsqZ17Ra1EJKds3QsrbWyRKgSxNHiEHbhY+OlnVciaot5D0kDrR2ngPVkfQCSabN/FWhYrV5D4T/8utbq4xBZczB0bFvWbOffpMKtdIFaxb6eoD6RmHGX7a6AJfn2cVPz8K296hpeD1VU1c+AdUQ+iDBoPKAZiSfpapOFV+WtLz7XcDXpvaHqXJAzD2Xc/ZDcuVpeX1fTe/VVaXEOZH7Nvf1ClDUtP2k/D6pAkCsv5kR/ZkouVixU1+eTuDc3kU7uda36g7uZYUUkr7QB3wxlaY5IoNDsfUZUTp9iai+WpaVXMPeMQv/1AHdQVY4alZpzgbjh5Va09dija9z+qLo0X2KKLpT/POfTj0t95p44UKyLLTiese42bhMJYLPbtUv+VZtlqMKCBVooRh+c6e29M5bW+O6TCuJzc8aI4F9bhzB3SSHXjEvlhCmdOUmE9nN73WvWyDNA1lEl16iH6kHxHXmpSRy6bodWyyW4+J8aIQ2eyA/RH2V8Ylc7yS0uqH0HLL641ZPnV9DmnE0AiL8QLJb7qouEvxKalKE+/sKEJmjvlL771xIpK8n6Qu0EdwVmuIApDJHx+JJk0enaKnMYvSsJajJPGl956n4WbQDHOv/yGqK9FHJJ40niAcvtPJHEQAzdWtGmS9Js599nXrHaBYVc0d4j6YOofs30X+NYhi2U2Y6s7c2BI1gfQTpt3sX0XOHygR3VSqiCx6vDhzNlohw+09HqWZYo1+eweUSsRKy1br0bU46CZ1w87Rznl4yNq4sGYx0HDo2vHQa8OiJpAZnP3sW0Z+MgiVmwnavo3bDcYOI7EaiAGaAPSovSvndVvYbu1QRt6QwrSFszqvWwzHHCELwZqIZGBsL3wuGw+9AD43EVBjvuDtoCfx/70tg7nyWj6kBA8EWI4xX4SEujRmsQFqbFmEKsTzdMebr6xwLJHwb+TGm4o6T0ReomtB0id8X1CNFEHEdPOmGluJjng+wQ9oaNkoCIZC0OnrmZ8JCaASQN7Apo/WZqYB4m/YB8tmXaIMtqeQosnW7WfaDfgZAP/GIMzJxC/N047Go5U6n/Iuyn9VPREpAAAAABJRU5ErkJggg==" href='#' onClick={onClickDislike.bind(this, post)} onMouseOver={mouseoverBt.bind(this, post)}/>
                            <Mdb.Media object className='btlike' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAT6SURBVGhD3ZpbbxNHFMddlYf2paUvVfvcCx+AD5CntqjgtQOJECTeXUDiTpGqwkMjeKAPqBUgcREioqmqliakammpeiGAoK3UKxREi0q5JOu1YzAC4sRxHDckmZ4zOSH25qw9vuzG6l/6SY535pz/eGZnZ2YT8ErRxpbne8ORl+2wsRDBz/gdXa5P2YtXPhMNGcuskH7I0oyL0ZCehr+FC0NWyLgAHLSC5tLe5rVPU5i5kQgEHusLRV4D85+C8RxjWBE9hzH6wvqrGJPC+yP8JaOafpk3VhWX+oKREKXxTjjOYUicYQzUFs3oiS82X6K0tZWlmathCIywiT0Ac8GPZlL66iUaGubBOO7gkvmBpentorn5cbJTmWJNTU/Cr3KSS+An6MFqMJ4gW+UJf4V6aMQ06KWinpnL4eSKZhwme2qCSmtmBakTbE3XyWZxTU2x/s1O5QJDLBMLtr5Idt0FBb1/TlSN/h3Z5QVTXSNfkcdetkYkd74nUp0nRPrbsyL9VY8Y6OgUiS1tbHkk8UabGPigS5bFOlg3ueNdGYsr7wYMMY1sFwrXOcrLjsZV4sHRY2I8NSTclLvRK5Jv735UJ9m2W37npvGBQfGg/SMZuyCXC7g4JeuFsoLGIq6Ck1jLRpG9/BelL6HJSZE69pkEP6soe+lPEVu5gc3tBBeaZH9GU6tYvsI02P2jV69RSu+EOZSGmmYcJ/tTght8vspSfLD7JKXyXqmuL1gP+cDwyt5Y1PIUNQOeG5rexBXMJ9a6SUxkRymN95oYycphzHnJp2DZD8PqEFcon3v7jlAK/3Rvz2HWSz4w0x6gZsihdYErlE/66zMU3j/hFM15KUAzfqNmyHVVsT22JPPDLxTeP2XO/8R6cTAkG2G9bjzHXJzF8OnvKbx/Sp86x3pxcqux9dlAn7Z6AXfRSepjeBb4rIEPu1kvTnB9GMAzJ+6ikzvbdlF4/3T7zZ2sFyfYBuWGRMOmeJhIUgrvNRZPyJysFweyIapDC7l/sIPSeK/7B95nPXDIoaV6s0tgQZf75yal8k65azeVewORNzsK/hhyXnSjf8N2+dT1Shi7f/12NjeLpg/KRqBUHoj53H1nn/JqtixNTIi7u/ayOV3JfyCqLFGcpD75nLLXTrjc53IVA7zvp2ZAQ/AslylUFBjDIz9fJAvVK/Pjr2XdF9MU7BRpGT/KFSyG3J9c+ZusVC6MUe5WF8FDkoJlPArW9t1c4VLEVqwvuoUtpdz1W8Jevo6NXRq9i+zPCN918IVLE49sFmOJO2RNXWN2XNblYqpgB81XyP6M8PABuuoProIK8VVbpTFV/WvFRNzcysZSAWdasj5b5R4HOcEdnco9g4cXOCS5GMqEI0vINi98ycJWVAWe/rjfFuPjZHtGk/AdTtuVzE4FaPo3ZNddeByJswEboAz6122Te5iHt5OS4Z7zon/tW2zZcoBJadgO6y+Q3eKCDb3BBakLwnor2VQTHuGzgeYQXIGQPXX9b170oPB1FwT50hl0DjhR8au3acme0fR2Jrgv4HCquCc4QdeaQIZL5gU4O8F92kLpayuc9iD4KS5xTYHnhPIUW41w6YzvJ1gTVYAx7ZAZpDT+Cd9PQA8dBwNZzpgKsq5mdLILQL+FewK4f8JwY+4Hfsd9NGdagtdge4plsWdn7SfqTXiygf8Yg2dOCH5+dNpRcwUC/wFEDPCGA8JYGAAAAABJRU5ErkJggg==" href='#' onClick={onClickLike.bind(this, post)} onMouseOver={mouseoverBt.bind(this, post)}/>
                        </div>
                    </Mdb.CardBody>
                </Mdb.Card>
            ) : '' }
        </Mdb.CardGroup>
    )
}

function mouseoverBt(e) {
    let card = document.getElementById(e.id)
    wCard = card.offsetWidth
}
function onClickDislike(e) {
    const id_user = e.uid
    let card = document.getElementById(e.id)
    card.className = 'animated fadeOutLeft'
    card.style.width = wCard - 15 + 'px'
    card.style.marginLeft = '15px'
    axios.post('/Dislike', { id_user, idMe })
    .then((result) => {
        axios.post('/searchUsersBis', { idMe })
            .then((res) => {
                searchPage.TestsetState(res.data)
            })
    })
}
function onClickLike(e) {
    const id_user = e.uid
    const login_user = e.login
    let card = document.getElementById(e.id)
    card.className = 'animated fadeOutRight'
    card.style.width = wCard - 15 + 'px'
    card.style.marginLeft = '15px'
    axios.post('/Like', { id_user, idMe, login_user })
        .then((result) => {
            socket.emit('SendNewNotif', { id_user, login_user })
            if (result.data === 'match') searchPage.toggle2(false)
            axios.post('/searchUsersBis', { idMe })
                .then((res) => {
                    searchPage.TestsetState(res.data)
                })
        })
}

const Handle = Slider.Handle
const SliderWithTooltip = createSliderWithTooltip(Slider)
function starFormatter(v) {
    return `${v} ☆`;
}
function kmFormatter(v) {
    return `${v} kms`;
}
function tagFormatter(v) {
    return `#${v}`;
}
const handle = (props) => {
    const { value, dragging, index, ...restProps } = props;
    return (
        <Tooltip
            prefixCls="rc-slider-tooltip"
            overlay={value}
            visible={dragging}
            placement="top"
            key={index}
        >
            <Handle value={value} {...restProps} onChange={this.onChange} />
        </Tooltip>
    );
}
const wrapperStyle = { width: 400, marginLeft: 50 }

/*   Var pour les tags   */ 
const KeyCodes = {
    comma: 188,
    enter: 13,
}
const delimiters = [KeyCodes.comma, KeyCodes.enter]

class searchPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ageMin: 18,
            ageMax: 30,
            popu: 0,
            dist: 1,
            collapse: false,
            modal: false,
            tags:[],
            suggestions:[],
            datas:[],
            filter: '',
            flag: 0
        }
        this.toggle = this.toggle.bind(this)
        searchPage.toggle2 = searchPage.toggle2.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.handleAddition = this.handleAddition.bind(this)
        this.componentWillMount = this.componentWillMount.bind(this)
        searchPage.TestsetState = searchPage.TestsetState.bind(this)
    }
    toggle = (e) => {
        e.preventDefault()
        this.setState({ collapse: !this.state.collapse })
    }
    static toggle2() {
        this.setState({ modal: !this.state.modal })
    }
    handleDelete(i) {
        const { tags } = this.state;
        this.setState({ tags: tags.filter((tag, index) => index !== i) })
    }
    handleAddition(tag) {
        tag.text = tagFormatter(tag.text)
        this.setState(state => ({ tags: [...state.tags, tag] }))
    }
    static TestsetState(data) {
        this.setState({
            datas: data
        })
    }
    onLoadPage = (filter) => {
        let { ageMin, ageMax, popu, dist, tags, datas } = this.state
        popu = popu * 20
        axios.post('/matchSug', { idMe, ageMin, ageMax, popu, dist, tags, datas, filter })
            .then((result) => {
                let tagsSug = result.data[result.data.length - 1]
                if (result.data !== 'Empty') {
                    var obj = JSON.parse(tagsSug)
                    this.setState({ suggestions: obj })
                    let tabRes = result.data.splice(0, result.data.length - 1)
                    this.setState({ datas: tabRes })
                } else this.setState({ datas: result.data })
            })
    }
    onSubmit = () => {
        let { ageMin, ageMax, popu, dist, tags, datas, filter } = this.state
        popu = popu * 20
        axios.post('/searchUsers', { idMe, ageMin, ageMax, popu, dist, tags, datas, filter })
            .then((result) => {
                let tagsSug = result.data[result.data.length - 1]
                if (result.data !== 'Empty') {
                    var obj = JSON.parse(tagsSug)
                    this.setState({ suggestions: obj })
                    let tabRes = result.data.splice(0, result.data.length - 1)
                    this.setState({ datas: tabRes })
                } else this.setState({ datas: result.data })
                this.setState({ flag: 1 })
            })
    }
    onChangeAge = (e) => {
        this.setState({ ageMin: e[0] })
        this.setState({ ageMax: e[1] })
        let { popu, dist, tags, filter } = this.state
        popu = popu * 20
        let ageMin = e[0]
        let ageMax = e[1]
        axios.post('/searchUsers', { idMe, ageMin, ageMax, popu, dist, tags, filter })
            .then((result) => {
                if (result.data !== 'Empty') {
                    let tabRes = result.data.splice(0, result.data.length - 1)
                    this.setState({ datas: tabRes })
                } else this.setState({ datas: result.data })
                this.setState({ flag: 1 })
            })
    }
    onChangePopu = (e) => {
        this.setState({ popu: e})
        let { ageMin, ageMax, popu, dist, tags, filter } = this.state
        popu = e * 20
        axios.post('/searchUsers', { idMe, ageMin, ageMax, popu, dist, tags, filter })
        .then((result) => {
            if (result.data !== 'Empty') {
                let tabRes = result.data.splice(0, result.data.length - 1)
                this.setState({ datas: tabRes })
            } else this.setState({ datas: result.data })
            this.setState({ flag: 1 })
        })
    }
    onChangeDistance = (e) => {
        this.setState({ dist: e })
        let { ageMin, ageMax, popu, tags, filter } = this.state
        popu = popu * 20
        let dist = e
        axios.post('/searchUsers', { idMe, ageMin, ageMax, popu, dist, tags, filter })
        .then((result) => {
            if (result.data !== 'Empty') {
                let tabRes = result.data.splice(0, result.data.length - 1)
                this.setState({ datas: tabRes })
            } else this.setState({ datas: result.data })
            this.setState({ flag: 1 })
        })
    }
    componentWillMount = async () => {
        axios.post('/loadParamSearch', { idMe }).then((result) => {
            var obj = JSON.parse(result.data[0].tags)
            this.setState({
                ageMin: result.data[0].ageMin,
                ageMax: result.data[0].ageMax,
                popu: result.data[0].popu,
                dist: result.data[0].location,
                tags: obj
            })
            this.onLoadPage()
        })
    }
    ChangeFilter = (e) => {
        let { ageMin, ageMax, popu, dist, tags, flag } = this.state
        popu = popu * 20
        this.setState({ [e.target.name]: e.target.value })
        let filter = e.target.value
        this.setState({ filter: filter })
        if (flag === 1) {
            axios.post('/searchUsers', { idMe, ageMin, ageMax, popu, dist, tags, filter })
                .then((result) => {
                    if (result.data !== 'Empty') {
                        let tabRes = result.data.splice(0, result.data.length - 1)
                        this.setState({ datas: tabRes })
                    } else this.setState({ datas: result.data })
                })
        } else this.onLoadPage(filter)
    }
    render() {
        const { tags, suggestions, datas, ageMin, ageMax, popu, dist } = this.state;
        let card
        if (datas === 'Empty')
            card = <Mdb.Container>Nous ne pouvons vous présenter de nouveaux profils, veuillez élargir les champs de votre recherche!!</Mdb.Container>
        else
            card = <CardPerso datas={datas} />
        return (
            <div>
                <Mdb.Modal color="success" isOpen={this.state.modal} toggle={this.toggle2}>
                    <Mdb.CardImage src="http://www.jtwo.tv/wp-content/uploads/2017/06/Tinder-its-a-match-typography-aiga.png" style={{ width: '500px' }}/>
                    <Mdb.ModalFooter>
                        <Mdb.Button color="success" onClick={searchPage.toggle2}>Close</Mdb.Button>{' '}
                    </Mdb.ModalFooter>
                </Mdb.Modal>
            <div>
                <Mdb.Button color="primary" onMouseUp={this.toggle} style={{ marginBottom: '1rem', marginLeft: '20px', marginTop: '20px' }}>Paramètres de recherche</Mdb.Button>
                <Mdb.Collapse isOpen={this.state.collapse}>
                    <form>
                        <div className='box' style={wrapperStyle}>
                            <p>Définir une tranche d'âge : {ageMin} - {ageMax} ans</p>
                            <Range min={18} max={100} defaultValue={[ageMin, ageMax]} pushable handle={handle} onAfterChange={this.onChangeAge} />
                            <p>Définir un indice de popularité minimum : {popu} ☆</p>
                            <SliderWithTooltip tipFormatter={starFormatter} max={5} defaultValue={this.state.popu} handle={handle} trackStyle={{ backgroundColor: '#E5E7E9' }} railStyle={{ backgroundColor: '#AED6F1' }} onAfterChange={this.onChangePopu}/> 
                            <p>Définir une distance maximale : {dist} kms</p>
                            <SliderWithTooltip tipFormatter={kmFormatter} defaultValue={1} min={1} max={50} handle={handle} onAfterChange={this.onChangeDistance}/><br/>
                            <p>Définir un ou plusieurs tags : </p>
                            <ReactTags inline tags={tags}
                                style={{zIndex: '10000'}}
                                suggestions={suggestions}
                                handleDelete={this.handleDelete}
                                handleAddition={this.handleAddition}
                                delimiters={delimiters}
                                classNames={{
                                    tags: 'tagsClass',
                                    tagInput: 'tagInputClass',
                                    tagInputField: 'tagInputFieldClass',
                                    selected: 'selectedClass',
                                    tag: 'tagClass',
                                    remove: 'removeClass',
                                    suggestions: 'suggestionsClass',
                                    activeSuggestion: 'activeSuggestionClass'
                                }}
                                /><br/>
                            <div>
                                <Mdb.Button color="primary" onClick={this.onSubmit}>Filtrer selon les tags</Mdb.Button>
                            </div>
                        </div>
                    </form>
                </Mdb.Collapse>
                <SelectSearch style={{ width: '100%' }} onChange={this.ChangeFilter} value={this.state.filter} />
            </div>
                {card}
            </div>
        )
    }
}
export default searchPage;
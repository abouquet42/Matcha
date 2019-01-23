// import React from 'react'
// import { Card, Icon } from 'semantic-ui-react'

// const extra = (
//   <a>
//     <Icon name='user' />
//     16 Friends
//   </a>
// )

// const ImgMediaCard = (props) => (
//   <Card
//     className='cardContent'
//     fluid
//     image={props.image}
//     header='Elliot Baker'
//     meta='Friend'
//     description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
//     extra={extra}
//   />
// )

import React from 'react'
import { Button, Card, CardBody, CardImage, CardTitle, CardText } from 'mdbreact'
import StarRatings from 'react-star-ratings'

class ImgMediaCard extends React.Component {
  render () {
    const {image, all} = this.props
    let genre = ''
    if (all.genre === 'Man') genre = <i className='fas fa-mars' style={{ color: 'blue' }} />
    else genre = <i className='fas fa-venus' style={{ color: 'pink' }} />
    return (
      <Card>
        <CardImage className='img-fluid' src={image} waves />
        <CardBody>
          <CardTitle className='h2 nameCard'>{all.first_name} {genre}
            <StarRatings
              rating={all.popu / 20}
              starRatedColor='orange'
              starDimension='15px'
              starSpacing='1px'
              numberOfStars={5}
              name='rating'
            />
          </CardTitle>
          <CardText>{all.bio}</CardText>
          <Button href={'/user?' + all.login}>Full profil</Button>
        </CardBody>
      </Card>
    )
  }
}

export default ImgMediaCard

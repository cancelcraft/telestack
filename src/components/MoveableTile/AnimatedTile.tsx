import React from "react"
import { Easing } from "react-native"
import { GestureApi } from "./MoveableTile";

interface Props {
  originLeft: number
  originTop: number
  left: number
  top: number
  isExploded: boolean
  onMoving(): GestureApi
}

export default (MoveableTile) => {

  class SuperMoveableTile extends React.Component<Props> {

    private ref: any = null
    private isAnimating = false
    private initialFrametime = 0
    private duration = 800
    private currentLeft = 0
    private currentTop = 0
    private prevLeft = 0
    private prevTop = 0
    private destLeft = 0
    private destTop = 0

    constructor(props: Props) {
      super(props)

      this.currentLeft = props.originLeft
      this.currentTop  = props.originTop
    }

    private setRef = (ref) => {
      this.ref = ref
    }

    private animateFrame = frametime => {
      // Divide elapsed time by duration. (The elapsed time is the difference of frametime and initial frametime.)
      const progress = (frametime - this.initialFrametime) / this.duration
      const value = Easing.ease(progress)

      this.currentLeft = this.prevLeft - value * (this.prevLeft - this.destLeft)
      this.currentTop  = this.prevTop  - value * (this.prevTop  - this.destTop)


      this.ref.setNativeProps({
        style: {
          left: this.currentLeft,
          top:  this.currentTop
        }
      })

      this.isAnimating = progress < 1 // If the value ever reaches 1, then this view has reached is destination.

      if (this.isAnimating) {
        requestAnimationFrame(this.animateFrame)
      }
    }

    private animate = (duration, toLeft, toTop) => {
      // Correct animation principles.
      this.duration = duration
      this.prevLeft = this.currentLeft
      this.prevTop  = this.currentTop
      this.destLeft = toLeft
      this.destTop  = toTop

      // Changing the targets is sufficient for the animation to reprogram.
      if (this.isAnimating) {
        console.log("yep")

      } else {
        if (this.duration === 0) {

          this.currentLeft  = toLeft
          this.currentTop   = toTop

          this.ref.setNativeProps({
            style: {
              left: toLeft,
              top:  toTop
            }
          })
        } else {

          requestAnimationFrame(frametime => {
            this.initialFrametime = frametime
            this.animateFrame(frametime)
          })
        }
      }
    }

    render() {
      return (
        <MoveableTile {...this.props} setRef={this.setRef} animate={this.animate}>
          { this.props.children }
        </MoveableTile>
      )
    }
  }

  return SuperMoveableTile
}

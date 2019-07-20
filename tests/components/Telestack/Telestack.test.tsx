import React from "react"
import { shallow } from "enzyme"
import Telestack from "../../../src/components/Telestack/Telestack"

describe("Telestack", () => {
  describe("when list is null", () => {
    const testList: any[] = null as any
    let syncListSpy: jasmine.Spy
    let callbackSpy: jasmine.Spy

    beforeEach(() => {
      syncListSpy = jasmine.createSpy()
      callbackSpy = jasmine.createSpy()

      shallow(<Telestack list={testList} isEditable={false} syncList={syncListSpy}>{callbackSpy}</Telestack>)
    })

    it("should not call callback", () => {
      expect(callbackSpy).not.toHaveBeenCalled()
    })
  })

  describe("when list is empty", () => {
    const testList = []
    let syncListSpy: jasmine.Spy
    let callbackSpy: jasmine.Spy

    beforeEach(() => {
      syncListSpy = jasmine.createSpy()
      callbackSpy = jasmine.createSpy()

      shallow(<Telestack list={testList} isEditable={false} syncList={syncListSpy}>{callbackSpy}</Telestack>)
    })

    it("should not call callback", () => {
      expect(callbackSpy).not.toHaveBeenCalled()
    })
  })

  describe("when exploded", () => {
    let syncListSpy: jasmine.Spy
    let setStateSpy: jasmine.Spy

    let onStartMoveRef: any = null
    const testList: string[] = [ "first", "second", "third", "fourth" ]
    let liftedIndex = 1
    let liftedId: string = ""

    beforeEach(() => {
      syncListSpy = jasmine.createSpy()
      setStateSpy = jasmine.createSpy()

      shallow(<Telestack list={testList} isEditable={true} syncList={syncListSpy}>{(id, index, onStartMove) => {
        if (liftedIndex === index) {

          // Setting anything in the render callback is dangerous, because it will be overwritten after the first increment.
          onStartMoveRef = onStartMove
          liftedId = id

        }

        return null
      }}</Telestack>)
    })

    it("should move lifted ID down to target position", () => {
      const targetIndex = 0
      const moveApi = onStartMoveRef()
      moveApi.onMove(targetIndex)
      moveApi.onRelease()

      expect(syncListSpy).toHaveBeenCalledWith(["second", "first", "third", "fourth"])
    })

    it("should move lifted ID up to target position", () => {
      const targetIndex = 3
      const moveApi = onStartMoveRef()
      moveApi.onMove(targetIndex)
      moveApi.onRelease()

      expect(syncListSpy).toHaveBeenCalledWith(["first", "third", "fourth", "second"])
    })

    it("must call syncList after release with the newly positioned items", () => {
      let moveApi = onStartMoveRef()

      expect(liftedIndex).toEqual(1)
      expect(liftedId).toEqual("second")

      liftedIndex = 3 // Setting this before calling move, so that the render callback will capture the onStartMoveRef.
      moveApi.onMove(3)
      moveApi.onRelease()

      // Initialize second move.
      moveApi = onStartMoveRef()
      expect(syncListSpy).toHaveBeenCalledWith(["first", "third", "fourth", "second"])

      // expect(liftedIndex).toEqual(3)
      // expect(liftedId).toEqual("second")
      //
      // liftedIndex = 2 // Setting this before calling move, so that the render callback will capture the liftedID.
      // moveApi.onMove(2)
      // moveApi.onRelease()
      //
      // expect(liftedId).toEqual("second")
    })

    // ??? Shouldn't this restore original list order ???
    it("should not do anything when targetIndex exceeds listLength", () => {
      const targetIndex = 8
      const moveApi = onStartMoveRef()
      moveApi.onMove(targetIndex)
      moveApi.onRelease()

      expect(syncListSpy).not.toHaveBeenCalled()
    })

    it("should not divide by zero when targetIndex equals liftedIndex", () => {
      const targetIndex = liftedIndex
      const moveApi = onStartMoveRef()
      moveApi.onMove(targetIndex)
      moveApi.onRelease()

      expect(setStateSpy).not.toHaveBeenCalled()
      expect(syncListSpy).not.toHaveBeenCalled()
    })
  })
})

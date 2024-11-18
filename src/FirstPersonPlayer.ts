import {
    HavokPlugin,
    MeshBuilder,
    PhysicsBody,
    PhysicsMaterialCombineMode,
    PhysicsMotionType,
    PhysicsShapeCapsule,
    PhysicsShapeContainer,
    PhysicsShapeCylinder,
    Quaternion,
    Scene,
    ShapeCastResult,
    TransformNode,
    UniversalCamera,
    Vector2,
    Vector3,
    VirtualJoystick,
} from '@babylonjs/core'
import {TempVec3Factory} from './utils/TempObjectFactory'
import {Clamp as clamp} from '@babylonjs/core/Maths/math.scalar.functions'

export class FirstPersonPlayer {
    public moveSpeed: number = 35
    public sprintMoveSpeed: number = 60
    private readonly scene: Scene
    private readonly havok: HavokPlugin
    private readonly eventHandlers = {
        updateLoop: null,
        keyDown: null,
        keyUp: null,
        blur: null,
        pointerDown: null,
        pointerMove: null,
    }
    private readonly inputActions = {
        move: {
            up: false,
            down: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
        },
        look: new Vector2(),
    }
    private leftJoystick?: VirtualJoystick
    private rightJoystick?: VirtualJoystick

    constructor(scene: Scene, havok: HavokPlugin) {
        this.scene = scene
        this.havok = havok
        this.setupRig()
        this.bindEvents()

        if (window.matchMedia('(pointer: coarse)').matches) {
            this.leftJoystick = new VirtualJoystick(true, {
                color: 'red',
                limitToContainer: true,
            })
            this.rightJoystick = new VirtualJoystick(false, {
                limitToContainer: true,
            })
            this.rightJoystick.reverseUpDown = true
        }
    }

    private _isGrounded = false

    public get isGrounded() {
        return this._isGrounded
    }

    private _camera: UniversalCamera

    public get camera() {
        return this._camera
    }

    private _root: TransformNode

    public get root(): TransformNode {
        return this._root
    }

    public get position() {
        return this._root.position
    }

    public set position(value: Vector3) {
        this.root.position = value
    }

    public get rotation() {
        return this.root.rotation.y
    }

    public set rotation(value: number) {
        this.root.rotation.y = value
    }

    setupRig() {
        this._root = new TransformNode('FirstPersonPlayer', this.scene)
        this._root.position.y += 5
        this._root.rotationQuaternion = Quaternion.Identity()
        const capsuleMesh = MeshBuilder.CreateCapsule('Capsule', {height: 1.8, radius: .5}, this.scene)
        capsuleMesh.parent = this._root
        capsuleMesh.position.y = 0.9
        this._camera = new UniversalCamera('Camera', new Vector3(), this.scene)
        this._camera.parent = this._root
        this._camera.position.y = 1.65
        // this._camera.viewport = new Viewport(0, 0, 1, .5)
        this._camera.minZ = .1
        this._camera.maxZ = 1000
        this._camera.fov = Math.PI / 2
        // const thirdPersonCam = new ArcRotateCamera('camera', Tools.ToRadians(90), Tools.ToRadians(65), 10, Vector3.Zero(), this.scene)
        // thirdPersonCam.setTarget(this._root, true, false, false)
        // thirdPersonCam.allowUpsideDown = false
        // thirdPersonCam.panningSensibility = 0
        // thirdPersonCam.allowUpsideDown = false
        // thirdPersonCam.lowerRadiusLimit = 0
        // thirdPersonCam.upperRadiusLimit = 30
        // thirdPersonCam.upperBetaLimit = Math.PI / 2.2
        // thirdPersonCam.panningSensibility = 0
        // thirdPersonCam.pinchDeltaPercentage = 0.00060
        // thirdPersonCam.wheelPrecision = 20
        // thirdPersonCam.useBouncingBehavior = false
        // thirdPersonCam.useAutoRotationBehavior = false
        // thirdPersonCam.attachControl(this.scene.getEngine().inputElement, true)
        // thirdPersonCam.radius = 10
        // thirdPersonCam.alpha = -1
        // thirdPersonCam.beta = 1
        // thirdPersonCam.viewport = new Viewport(.8, .8, .2, .2)
        // this.scene.activeCameras.push(this._camera, thirdPersonCam)

        const capsule = new PhysicsShapeCapsule(new Vector3(0, 0 + .5, 0), new Vector3(0, 1.8 - .5, 0), .4, this.scene)
        capsule.material.friction = 1
        capsule.material.restitution = 0
        capsule.material.staticFriction = 20
        capsule.material.frictionCombine = PhysicsMaterialCombineMode.MULTIPLY
        const cylinder = new PhysicsShapeCylinder(new Vector3(0, .4, 0), new Vector3(0, 1.8, 0), .5, this.scene)
        cylinder.material.friction = 1
        cylinder.material.restitution = 0
        cylinder.material.staticFriction = 20
        cylinder.material.frictionCombine = PhysicsMaterialCombineMode.MULTIPLY
        const rootShape = new PhysicsShapeContainer(this.scene)
        rootShape.addChild(capsule)
        rootShape.addChild(cylinder)
        const body = new PhysicsBody(this._root, PhysicsMotionType.DYNAMIC, false, this.scene)
        body.shape = rootShape
        body.disablePreStep = false
        body.setMassProperties({mass: 1000, inertia: Vector3.ZeroReadOnly})
    }

    onKeyDown(e: KeyboardEvent) {
        // e.preventDefault()
        if (e.repeat) return
        switch (e.key.toLowerCase()) {
            case 'w':
                this.inputActions.move.up = true
                break
            case 's':
                this.inputActions.move.down = true
                break
            case 'a':
                this.inputActions.move.left = true
                break
            case 'd':
                this.inputActions.move.right = true
                break
            case ' ':
                this.inputActions.move.jump = true
                break
            case 'shift':
                this.inputActions.move.sprint = true
                break
        }
    }

    onKeyUp(e: KeyboardEvent) {
        // e.preventDefault()
        if (e.repeat) return
        switch (e.key.toLowerCase()) {
            case 'w':
                this.inputActions.move.up = false
                break
            case 's':
                this.inputActions.move.down = false
                break
            case 'a':
                this.inputActions.move.left = false
                break
            case 'd':
                this.inputActions.move.right = false
                break
            case ' ':
                this.inputActions.move.jump = false
                break
            case 'shift':
                this.inputActions.move.sprint = false
                break
        }
    }

    onPointerDown(e: PointerEvent) {
        const inputElem = this.scene.getEngine().getInputElement()
        if (inputElem.requestPointerLock) {
            const result = inputElem.requestPointerLock()
            if (typeof result !== 'undefined') {
                result.catch(e => {
                    console.error('Failed to request pointer lock', e)
                })
            }
        }
    }

    onPointerMove(e: PointerEvent) {
        this.inputActions.look.x += e.movementX
        this.inputActions.look.y += e.movementY
    }

    updateLoop() {
        if (this.leftJoystick && !this.leftJoystick.pressed) {
            this.leftJoystick.clearPosition()
            this.leftJoystick.deltaPosition.setAll(0)
        }
        if (this.rightJoystick && !this.rightJoystick.pressed) {
            this.rightJoystick.clearPosition()
            this.rightJoystick.deltaPosition.setAll(0)
        }

        const shapeLocalResult = new ShapeCastResult()
        const hitWorldResult = new ShapeCastResult()
        this.havok.shapeCast({
            shape: this._root.physicsBody.shape,
            rotation: this._root.rotationQuaternion,
            startPosition: this._root.position,
            endPosition: new Vector3(this._root.position.x, this._root.position.y - 10, this._root.position.z),
            shouldHitTriggers: false,
        }, shapeLocalResult, hitWorldResult)

        this._isGrounded = (this._root.position.y - hitWorldResult.hitPoint.y) < 0.1

        using moveAxis = TempVec3Factory.get()
        moveAxis.setAll(0)
        if (this.inputActions.move.up) moveAxis.z += 1
        if (this.inputActions.move.down) moveAxis.z -= 1
        if (this.inputActions.move.left) moveAxis.x -= 1
        if (this.inputActions.move.right) moveAxis.x += 1

        if (this.leftJoystick) {
            moveAxis.x += this.leftJoystick.deltaPosition.x
            moveAxis.z += this.leftJoystick.deltaPosition.y
        }
        moveAxis.normalize()
        let speed = this.moveSpeed
        if (this.inputActions.move.sprint) {
            speed = this.sprintMoveSpeed
        }
        moveAxis.scaleInPlace(this.scene.deltaTime / 1000 * speed)
        if (!this._isGrounded) {
            moveAxis.scaleInPlace(.25)
        }
        moveAxis.applyRotationQuaternionInPlace(this._root.rotationQuaternion)
        const velocity = this._root.physicsBody.getLinearVelocity()
        velocity.addInPlace(moveAxis)
        if (this._isGrounded) {
            velocity.x *= .9
            velocity.z *= .9
        } else {
            velocity.x *= .95
            velocity.z *= .95
        }
        if (this.inputActions.move.jump && this._isGrounded) {
            velocity.y += 5
            this.inputActions.move.jump = false
        }
        this._root.physicsBody.setLinearVelocity(velocity)

        let lookX = this.inputActions.look.x
        let lookY = this.inputActions.look.y
        if (this.rightJoystick) {
            lookX += (this.rightJoystick.deltaPosition.x * 5)
            lookY += (this.rightJoystick.deltaPosition.y * 5)
        }
        this._root.addRotation(0, lookX * (this.scene.deltaTime / 1000) * .25, 0)
        this._camera.rotation.x += lookY * (this.scene.deltaTime / 1000) * .15
        this._camera.rotation.x = clamp(this._camera.rotation.x, -Math.PI / 2, Math.PI / 2)
        this.inputActions.look.setAll(0)
    }

    onPageBlur() {
        this.inputActions.move.up = false
        this.inputActions.move.down = false
        this.inputActions.move.left = false
        this.inputActions.move.right = false
        this.inputActions.move.sprint = false
    }

    public dispose() {
        this._root.dispose(false)
        this.scene.onAfterAnimationsObservable.remove(this.eventHandlers.updateLoop)
        const inputElem = this.scene.getEngine().getInputElement()
        document.removeEventListener('keydown', this.eventHandlers.keyDown)
        document.removeEventListener('keyup', this.eventHandlers.keyUp)
        inputElem.removeEventListener('pointerdown', this.eventHandlers.pointerDown)
        inputElem.removeEventListener('pointermove', this.eventHandlers.pointerMove)
        window.removeEventListener('blur', this.eventHandlers.blur)
    }

    private bindEvents() {
        this.eventHandlers.keyDown = e => this.onKeyDown(e)
        this.eventHandlers.keyUp = e => this.onKeyUp(e)
        this.eventHandlers.updateLoop = this.scene.onAfterAnimationsObservable.add(() => this.updateLoop())
        this.eventHandlers.pointerDown = (e) => this.onPointerDown(e)
        this.eventHandlers.pointerMove = (e) => this.onPointerMove(e)
        this.eventHandlers.blur = () => this.onPageBlur()

        const inputElem = this.scene.getEngine().getInputElement()
        document.addEventListener('keydown', this.eventHandlers.keyDown)
        document.addEventListener('keyup', this.eventHandlers.keyUp)
        inputElem.addEventListener('pointerdown', this.eventHandlers.pointerDown)
        inputElem.addEventListener('pointermove', this.eventHandlers.pointerMove)
        window.addEventListener('blur', this.eventHandlers.blur)
    }
}
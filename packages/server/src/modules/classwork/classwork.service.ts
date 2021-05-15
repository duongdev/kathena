import { forwardRef, Inject } from '@nestjs/common'
import { /** DocumentType */ ReturnModelType } from '@typegoose/typegoose'
// import * as bcrypt from 'bcrypt'
// import { uniq } from 'lodash'
// import { ForbiddenError } from 'type-graphql'

import { Service, InjectModel, Logger } from 'core'
// import { isObjectId } from 'core/utils/db'
// import {
//   removeExtraSpaces,
//   stringWithoutSpecialCharacters,
// } from 'core/utils/string'
import { Course } from 'modules/academic/models/Course'
import { AuthService } from 'modules/auth/auth.service'
// import { OrgRoleName, Permission } from 'modules/auth/models'
import { OrgService } from 'modules/org/org.service'
// import { ANY, Nullable } from 'types'

import { ClassworkAssignment } from './models/ClassworkAssignment'
import { ClassworkMaterial } from './models/ClassworkMaterial'

@Service()
export class ClassworkService {
  private readonly logger = new Logger(ClassworkService.name)

  constructor(
    @InjectModel(ClassworkAssignment)
    private readonly classworkAssignmentsModel: ReturnModelType<
      typeof ClassworkAssignment
    >,

    @InjectModel(ClassworkMaterial)
    private readonly classworkMaterialModel: ReturnModelType<
      typeof ClassworkMaterial
    >,

    @InjectModel(Course)
    private readonly courseModel: ReturnModelType<typeof Course>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => OrgService))
    private readonly orgService: OrgService,
  ) {}

  /**
   * START CLASSWORK MATERIAL
   */

  // TODO: Delete this line and start the code here

  /**
   * END CLASSWORK MATERIAL
   */

  /**
   * START CLASSWORK ASSIGNMENT
   */

  async findClassworkAssignments(
    orgId: string,
    courseId?: string,
    searchText?: string,
  ): Promise<ClassworkAssignment[]> {
    const { classworkAssignmentsModel, courseModel } = this

    if (searchText) {
      if (courseId) {
        const course = courseModel.findById(courseId)
        if (!course) {
          throw new Error('Course not found')
        }

        // returns the classwork assignments list by searchText, orgId and courseId
        const listClassworkAssignments = await classworkAssignmentsModel.find({
          $text: {
            $search: searchText,
          },
          orgId,
          courseId,
        })
        return listClassworkAssignments
      }
      // returns the classwork assignments list by searchText and orgId
      const listClassworkAssignments = await classworkAssignmentsModel.find({
        $text: {
          $search: searchText,
        },
        orgId,
      })

      return listClassworkAssignments
    }

    // return all classwork assignments in Classwork
    const listClassworkAssignments = await classworkAssignmentsModel.find({
      orgId,
    })

    this.logger.log(listClassworkAssignments)
    return listClassworkAssignments
  }

  /**
   * END CLASSWORK ASSIGNMENT
   */
}

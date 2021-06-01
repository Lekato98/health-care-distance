import { DocumentType } from '@typegoose/typegoose';
import DoctorModel, { Doctor, IDoctor } from './DoctorModel';
import { Status } from '../IRole';
import { INACTIVE } from '../../../helpers/constants';

class DoctorService {
    public static async create(payload: IDoctor): Promise<DocumentType<Doctor>> {
        const doctor = new Doctor(payload);
        doctor.active = INACTIVE;
        doctor.status = Status.PENDING;
        return DoctorModel.create(doctor);
    }

    public static async deleteOneByUserId(userId: string): Promise<DocumentType<Doctor>> {
        return DoctorModel.findOneAndDelete({userId});
    }

    public static async findDoctorByUserId(userId: string): Promise<DocumentType<Doctor>> {
        return DoctorModel.findOne({userId});
    }

    public static async isExistByUserId(userId: string): Promise<boolean> {
        return DoctorModel.exists({userId});
    }
}

export default DoctorService;
